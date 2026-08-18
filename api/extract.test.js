import { describe, expect, it, vi } from 'vitest'
import handler from './extract.js'

/**
 * The security guard is the part worth testing hardest: this endpoint fetches
 * whatever URL it is handed, so a hole here is a server-side request forgery
 * into whatever else is reachable from the function.
 */

/**
 * Each call gets a fresh client IP unless one is given, so the guard tests do
 * not exhaust the rate limit on each other and start failing for the wrong
 * reason. The limiter has its own tests below.
 */
let clientCounter = 0

function invoke(body, headers = {}) {
  const withIp = { 'x-forwarded-for': `198.51.100.${(clientCounter += 1) % 250}`, ...headers }

  let status = 0
  let payload = null

  const res = {
    setHeader: vi.fn(),
    status(code) {
      status = code
      return this
    },
    json(value) {
      payload = value
      return value
    },
  }

  return handler({ method: 'POST', body, headers: withIp, socket: {} }, res).then(() => ({
    status,
    payload,
  }))
}

describe('request guard', () => {
  it('rejects anything that is not POST', async () => {
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() }
    await handler({ method: 'GET', headers: {}, socket: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it.each([
    ['http://localhost:5173/admin', 'loopback by name'],
    ['http://127.0.0.1/', 'loopback by address'],
    ['http://169.254.169.254/latest/meta-data/', 'cloud metadata endpoint'],
    ['http://10.0.0.5/', 'private class A'],
    ['http://192.168.1.1/', 'private class C'],
    ['http://172.16.0.1/', 'private class B'],
    ['http://db.internal/', 'internal TLD'],
    ['file:///etc/passwd', 'non-http scheme'],
    ['javascript:alert(1)', 'script scheme'],
    ['not a url at all', 'malformed'],
    ['', 'empty'],
  ])('refuses %s (%s)', async (url) => {
    const { status } = await invoke({ url })
    expect(status).toBe(400)
  })

  it('refuses a body with no url', async () => {
    const { status } = await invoke({})
    expect(status).toBe(400)
  })

  it('refuses an absurdly long url instead of fetching it', async () => {
    const { status } = await invoke({ url: `https://example.com/${'a'.repeat(3000)}` })
    expect(status).toBe(400)
  })
})

describe('YouTube links', () => {
  // Scraping YouTube server-side returns a JS shell whose title is "- YouTube",
  // so these go through oEmbed instead. Network-dependent, hence the tolerance
  // for a null result rather than a hard failure offline.
  it.each([
    'https://www.youtube.com/watch?v=cIKZslB67Yc',
    'https://youtu.be/cIKZslB67Yc',
    'https://www.youtube.com/shorts/cIKZslB67Yc',
  ])('reads a real title from %s', async (url) => {
    const { status, payload } = await invoke({ url })
    if (status !== 200) return // offline

    expect(payload.extraction).toBe('partial')
    expect(payload.recipe.name).not.toBe('- YouTube')
    expect(payload.recipe.name.length).toBeGreaterThan(3)
    expect(payload.recipe.imageUrl).toContain('cIKZslB67Yc')
  })

  it('is honest that a video yields no method', async () => {
    const { status, payload } = await invoke({ url: 'https://youtu.be/cIKZslB67Yc' })
    if (status !== 200) return

    expect(payload.recipe.ingredients).toEqual([])
    expect(payload.recipe.steps).toEqual([])
    expect(payload.extraction).not.toBe('full')
  })
})

describe('rate limiting', () => {
  it('cuts a single client off after the limit', async () => {
    const ip = '203.0.113.99'
    let blocked = 0

    // Every one of these is rejected at the URL guard before any network call,
    // so this measures the limiter, not the fetch.
    for (let i = 0; i < 20; i += 1) {
      const { status } = await invoke({ url: 'not-a-url' }, { 'x-forwarded-for': ip })
      if (status === 429) blocked += 1
    }

    expect(blocked).toBeGreaterThan(0)
  })

  it('does not punish a different client for the first one', async () => {
    const { status } = await invoke({ url: 'not-a-url' }, { 'x-forwarded-for': '203.0.113.1' })
    expect(status).toBe(400)
  })
})
