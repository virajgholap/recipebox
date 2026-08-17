/**
 * Recipe photography.
 *
 * Imported rather than referenced by path so Vite fingerprints and bundles
 * them. Every file is openly licensed and credited in ATTRIBUTION.md at the
 * repo root — if you add or swap a photo, add the credit in the same commit.
 *
 * A missing entry is not an error: RecipeHero falls back to its generated
 * gradient, so a recipe without a photo still looks deliberate.
 */

import birriaStyleBeefTacos from '../assets/recipes/birria-style-beef-tacos.jpg'
import blackBeanEnchiladasVerdes from '../assets/recipes/black-bean-enchiladas-verdes.jpg'
import chanaMasala from '../assets/recipes/chana-masala.jpg'
import charredCornBlackBeanTacos from '../assets/recipes/charred-corn-black-bean-tacos.jpg'
import coldSesameNoodleSalad from '../assets/recipes/cold-sesame-noodle-salad.jpg'
import crispyChickpeaShakshuka from '../assets/recipes/crispy-chickpea-shakshuka.jpg'
import dalMakhani from '../assets/recipes/dal-makhani.jpg'
import garlicButterShrimpScampi from '../assets/recipes/garlic-butter-shrimp-scampi.jpg'
import lemonRicottaPancakes from '../assets/recipes/lemon-ricotta-pancakes.jpg'
import misoButterMushroomPasta from '../assets/recipes/miso-butter-mushroom-pasta.jpg'
import noKneadRosemaryFocaccia from '../assets/recipes/no-knead-rosemary-focaccia.jpg'
import overnightCinnamonRolls from '../assets/recipes/overnight-cinnamon-rolls.jpg'

export const recipeImages = {
  'birria-style-beef-tacos': birriaStyleBeefTacos,
  'black-bean-enchiladas-verdes': blackBeanEnchiladasVerdes,
  'chana-masala': chanaMasala,
  'charred-corn-black-bean-tacos': charredCornBlackBeanTacos,
  'cold-sesame-noodle-salad': coldSesameNoodleSalad,
  'crispy-chickpea-shakshuka': crispyChickpeaShakshuka,
  'dal-makhani': dalMakhani,
  'garlic-butter-shrimp-scampi': garlicButterShrimpScampi,
  'lemon-ricotta-pancakes': lemonRicottaPancakes,
  'miso-butter-mushroom-pasta': misoButterMushroomPasta,
  'no-knead-rosemary-focaccia': noKneadRosemaryFocaccia,
  'overnight-cinnamon-rolls': overnightCinnamonRolls,
}

export default recipeImages
