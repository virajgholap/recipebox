/**
 * Builds public/og-image.png — the picture that shows when someone pastes a
 * link to Recipe Box into WhatsApp, iMessage, Slack, or a tweet.
 *
 * Without it the preview is a bare title and a grey box, which reads as
 * unfinished at exactly the moment you are asking someone to trust the link.
 *
 * Drawn rather than photographed so it stays on-brand with the app's own
 * generated hero art, and so there is no extra licence to track.
 *
 *   npm run og:generate
 */

import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../public/og-image.png')

const W = 1200
const H = 630

// Same palette as src/styles/tokens.css.
const CANVAS = '#faf8f5'
const TEXT = '#1f1b16'
const MUTED = '#6b6459'
const ACCENT = '#b4442a'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="a" cx="18%" cy="22%" r="62%">
      <stop offset="0%" stop-color="hsl(24 54% 84%)" />
      <stop offset="100%" stop-color="${CANVAS}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="b" cx="86%" cy="78%" r="58%">
      <stop offset="0%" stop-color="hsl(140 40% 82%)" />
      <stop offset="100%" stop-color="${CANVAS}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="c" cx="72%" cy="12%" r="42%">
      <stop offset="0%" stop-color="hsl(300 38% 88%)" />
      <stop offset="100%" stop-color="${CANVAS}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${CANVAS}" />
  <rect width="${W}" height="${H}" fill="url(#a)" />
  <rect width="${W}" height="${H}" fill="url(#b)" />
  <rect width="${W}" height="${H}" fill="url(#c)" />

  <g transform="translate(96, 140)">
    <rect x="0" y="0" width="56" height="56" rx="14" fill="${ACCENT}" opacity="0.12" />
    <!-- The app's own bowl mark, drawn rather than an emoji: the renderer here
         has no emoji font and substitutes a placeholder glyph. -->
    <g transform="translate(14, 14) scale(1.16)" fill="none" stroke="${ACCENT}"
       stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z" />
      <path d="M9 7.5c0-1.5 1.5-1.5 1.5-3M13 7.5c0-1.5 1.5-1.5 1.5-3" />
      <path d="M4 20.5h16" />
    </g>

    <text x="76" y="37" font-family="Georgia, 'Times New Roman', serif" font-size="29"
          font-weight="600" fill="${TEXT}">Recipe Box</text>

    <!-- 64px, not 82: at 82 the second line ran past the right edge and the
         preview cropped it mid-word. -->
    <text x="0" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="64"
          font-weight="700" fill="${TEXT}">The recipes you saved,</text>
    <text x="0" y="224" font-family="Georgia, 'Times New Roman', serif" font-size="64"
          font-weight="700" fill="${TEXT}">in a place you can find them.</text>

    <text x="0" y="292" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="${MUTED}">
      Paste a link. Get a card you can actually cook from.
    </text>

    <g transform="translate(0, 336)" font-family="Helvetica, Arial, sans-serif" font-size="22">
      <rect x="0" y="0" width="184" height="44" rx="22" fill="#e6f2e9" stroke="#c3e0cd" />
      <text x="92" y="29" text-anchor="middle" fill="#2c6b40">23 recipes</text>

      <rect x="200" y="0" width="214" height="44" rx="22" fill="#e7eef8" stroke="#c6d8ee" />
      <text x="307" y="29" text-anchor="middle" fill="#2f5586">80% vegetarian</text>

      <rect x="430" y="0" width="184" height="44" rx="22" fill="#fdf0dc" stroke="#f2ddb8" />
      <text x="522" y="29" text-anchor="middle" fill="#8a5a12">Cook mode</text>
    </g>
  </g>
</svg>
`

mkdirSync(dirname(out), { recursive: true })

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out)

console.log(`Wrote ${out} (${W}x${H})`)
