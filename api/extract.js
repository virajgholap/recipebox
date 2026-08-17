/**
 * POST /api/extract  { url }  ->  { recipe }  |  { error }
 *
 * Fetches a recipe page server-side and pulls structured data out of it. This
 * cannot run in the browser: reading another site's HTML is blocked by CORS,
 * which is the whole reason this file exists.
 *
 * How it extracts, in order of reliability:
 *   1. JSON-LD schema.org/Recipe — what most food blogs publish, and the only
 *      source here that gives real ingredients and steps.
 *   2. Open Graph tags — title and description only. Enough to save a stub
 *      for a video you can open later, which is what Instagram, TikTok, and
 *      YouTube realistically give you without their APIs.
 *
 * It deliberately reports which of the two it got, so the UI can be honest
 * rather than presenting an OG title as if it were a parsed recipe.
 */

const TIMEOUT_MS = 10000
const MAX_BYTES = 2_000_000

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Use POST.' })
  }

  const { url } = req.body ?? {}

  const target = safeUrl(url)
  if (!target) {
    return res.status(400).json({ error: 'That does not look like a valid http(s) link.' })
  }

  let html
  try {
    html = await fetchWithLimit(target)
  } catch (error) {
    const message =
      error.name === 'AbortError'
        ? 'That site took too long to respond.'
        : `Could not fetch that page (${error.message}).`
    return res.status(502).json({ error: message })
  }

  const jsonLd = extractJsonLdRecipe(html)
  if (jsonLd) {
    return res.status(200).json({ recipe: { ...jsonLd, sourceUrl: target.href }, extraction: 'full' })
  }

  const og = extractOpenGraph(html, target)
  if (og) {
    return res.status(200).json({ recipe: { ...og, sourceUrl: target.href }, extraction: 'partial' })
  }

  return res.status(422).json({
    error: 'No recipe data found on that page. You can still add it by hand.',
  })
}

/**
 * Only http(s), and never a private or loopback host — without this the
 * function is an open proxy into whatever else lives on the network.
 */
function safeUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 2000) return null

  let parsed
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  const host = parsed.hostname.toLowerCase()
  const blocked =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host.endsWith('.internal') ||
    host.endsWith('.local')

  return blocked ? null : parsed
}

async function fetchWithLimit(target) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(target.href, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': BROWSER_UA, accept: 'text/html,application/xhtml+xml' },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const type = response.headers.get('content-type') ?? ''
    if (!type.includes('html')) throw new Error('that link is not a web page')

    // Read with a ceiling so a huge or endless response cannot exhaust memory.
    const reader = response.body.getReader()
    const chunks = []
    let total = 0

    while (total < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
    reader.cancel().catch(() => {})

    return new TextDecoder('utf-8').decode(concat(chunks, total))
  } finally {
    clearTimeout(timer)
  }
}

function concat(chunks, total) {
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk.subarray(0, Math.min(chunk.length, total - offset)), offset)
    offset += chunk.length
    if (offset >= total) break
  }
  return out
}

/** Walks JSON-LD, including @graph and arrays, looking for a Recipe node. */
function extractJsonLdRecipe(html) {
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]

  for (const [, raw] of blocks) {
    let parsed
    try {
      parsed = JSON.parse(raw.trim())
    } catch {
      continue
    }

    const node = findRecipeNode(parsed)
    if (node) return normaliseRecipe(node)
  }

  return null
}

function findRecipeNode(value, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6) return null

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findRecipeNode(entry, depth + 1)
      if (found) return found
    }
    return null
  }

  const type = value['@type']
  const types = Array.isArray(type) ? type : [type]
  if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) return value

  if (value['@graph']) return findRecipeNode(value['@graph'], depth + 1)

  return null
}

function normaliseRecipe(node) {
  return {
    name: text(node.name)?.slice(0, 160) ?? '',
    blurb: text(node.description)?.slice(0, 240) ?? '',
    servings: parseServings(node.recipeYield),
    cookTimeMinutes: parseDuration(node.totalTime) ?? parseDuration(node.cookTime) ?? null,
    ingredients: toArray(node.recipeIngredient).map(text).filter(Boolean).slice(0, 60),
    steps: parseInstructions(node.recipeInstructions).slice(0, 40),
    imageUrl: parseImage(node.image),
  }
}

function extractOpenGraph(html, target) {
  const meta = (property) => {
    const pattern = new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i',
    )
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i',
    )
    return html.match(pattern)?.[1] ?? html.match(alt)?.[1] ?? null
  }

  const title = meta('og:title') ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
  if (!title) return null

  return {
    name: decodeEntities(title).trim().slice(0, 160),
    blurb: decodeEntities(meta('og:description') ?? '').trim().slice(0, 240),
    servings: null,
    cookTimeMinutes: null,
    ingredients: [],
    steps: [],
    imageUrl: meta('og:image'),
    siteName: meta('og:site_name') ?? target.hostname,
  }
}

// ------------------------------------------------------------------ helpers

function toArray(value) {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function text(value) {
  if (typeof value === 'string') return decodeEntities(stripTags(value)).trim()
  if (Array.isArray(value)) return text(value[0])
  if (value && typeof value === 'object') return text(value.text ?? value.name ?? value['@value'])
  return null
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Instructions come as strings, HowToStep objects, or HowToSection groups. */
function parseInstructions(value) {
  const out = []

  for (const entry of toArray(value)) {
    if (typeof entry === 'string') {
      out.push(...splitProse(decodeEntities(stripTags(entry))))
      continue
    }

    if (entry && typeof entry === 'object') {
      const type = String(entry['@type'] ?? '').toLowerCase()
      if (type === 'howtosection' && entry.itemListElement) {
        out.push(...parseInstructions(entry.itemListElement))
      } else {
        const step = text(entry.text ?? entry.name)
        if (step) out.push(step)
      }
    }
  }

  return out.map((step) => step.trim()).filter((step) => step.length > 3)
}

/** Some sites put the entire method in one string. Split it into steps. */
function splitProse(value) {
  if (value.length < 300) return [value]
  return value
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .reduce((acc, sentence) => {
      const last = acc[acc.length - 1]
      if (last && last.length < 120) acc[acc.length - 1] = `${last} ${sentence}`
      else acc.push(sentence)
      return acc
    }, [])
}

/** ISO 8601 duration -> minutes. PT1H30M -> 90. */
function parseDuration(value) {
  const raw = typeof value === 'string' ? value : text(value)
  if (!raw) return null

  const iso = raw.match(/^P(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?)?/i)
  if (iso && (iso[1] || iso[2] || iso[3])) {
    const days = Number(iso[1] ?? 0)
    const hours = Number(iso[2] ?? 0)
    const minutes = Number(iso[3] ?? 0)
    const total = Math.round(days * 1440 + hours * 60 + minutes)
    return total > 0 ? total : null
  }

  const loose = raw.match(/(\d+)\s*(hour|hr|minute|min)/i)
  if (loose) {
    const n = Number(loose[1])
    return /h/i.test(loose[2]) ? n * 60 : n
  }

  return null
}

function parseServings(value) {
  const raw = Array.isArray(value) ? value[0] : value
  const asText = typeof raw === 'number' ? String(raw) : text(raw)
  const match = asText?.match(/\d+/)
  return match ? Math.min(99, Math.max(1, Number(match[0]))) : null
}

function parseImage(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return parseImage(value[0])
  if (typeof value === 'object') return value.url ?? parseImage(value.contentUrl)
  return null
}
