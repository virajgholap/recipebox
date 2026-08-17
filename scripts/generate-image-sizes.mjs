/**
 * Generates 400w and 800w variants beside each 1200w recipe photo.
 *
 * A card renders about 300 CSS pixels wide. Serving it the 1200px original
 * means a phone downloads roughly ten times the pixels it can display, twenty
 * times over on the grid. The variants are committed, so this only needs
 * running when photos change:
 *
 *   npm run images:generate
 */

import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const dir = resolve(here, '../src/assets/recipes')
const WIDTHS = [400, 800]

const originals = readdirSync(dir).filter(
  (file) => file.endsWith('.jpg') && !/-\d+w\.jpg$/.test(file),
)

let written = 0
let savedBytes = 0

for (const file of originals) {
  const source = join(dir, file)
  const base = file.replace(/\.jpg$/, '')
  const originalSize = statSync(source).size

  for (const width of WIDTHS) {
    const out = join(dir, `${base}-${width}w.jpg`)

    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(out)

    written += 1
    if (width === 400) savedBytes += originalSize - statSync(out).size
  }
}

console.log(`Wrote ${written} variants for ${originals.length} photos.`)
console.log(
  `A phone loading the grid now pulls roughly ${Math.round(savedBytes / 1024)} KB less than before.`,
)
