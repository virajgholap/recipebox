/**
 * Builds the displayed recipe images from the originals in
 * src/assets/recipes/*.jpg.
 *
 * Two jobs, and the second one is the important one.
 *
 * 1. Size. A card renders about 300 CSS pixels wide. Serving the 1200px
 *    original means a phone downloads roughly ten times the pixels it can
 *    show. Three widths are emitted and picked via srcset.
 *
 * 2. Consistency. The source photos come from different people, cameras,
 *    kitchens and decades, so a grid of them reads as a jumble: one is cold
 *    and blue, the next is orange under a tungsten bulb, a third is blown out.
 *    Every output therefore gets the same treatment — identical crop ratio,
 *    normalised contrast, slightly pulled-back saturation and a common warm
 *    cast — so they sit together as a set. It does not turn a snapshot into
 *    studio photography, but it stops the grid fighting itself.
 *
 *   npm run images:generate
 */

import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const dir = resolve(here, '../src/assets/recipes')

const WIDTHS = [400, 800, 1200]
const RATIO = 3 / 2 // every card and hero crops to this, so pick it once here

/**
 * The shared look. Deliberately restrained: heavy grading makes food look
 * fake, and the goal is coherence, not a filter.
 */
function harmonise(pipeline) {
  return (
    pipeline
      .normalise({ lower: 1, upper: 99 }) // even out flat or blown-out exposure
      .modulate({
        saturation: 0.92, // dial back over-saturated phone shots
        brightness: 1.03, // lift the murky ones a little
        hue: 2, // nudge everything a touch warm, together
      })
      // NOT .tint(): sharp's tint desaturates to greyscale first and then
      // applies the colour, so it turns photographs black and white. Learned
      // by looking at the output.
      .sharpen({ sigma: 0.6 }) // recover the softness resizing costs
  )
}

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

    await harmonise(
      sharp(source).resize({
        width,
        height: Math.round(width / RATIO),
        fit: 'cover',
        position: 'attention', // crop toward the food, not the tablecloth
      }),
    )
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(out)

    written += 1
    if (width === 400) savedBytes += originalSize - statSync(out).size
  }
}

console.log(`Wrote ${written} images for ${originals.length} recipes.`)
console.log(`Uniform ${RATIO.toFixed(2)}:1 crop, normalised exposure, shared warm cast.`)
console.log(
  `A phone loading the grid pulls roughly ${Math.round(savedBytes / 1024)} KB less than the originals.`,
)
