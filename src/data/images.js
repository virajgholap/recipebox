/**
 * Recipe photography.
 *
 * Imported rather than referenced by path so Vite fingerprints and bundles
 * them. Every file is openly licensed and credited in ATTRIBUTION.md at the
 * repo root — if you add or swap a photo, add the credit in the same commit.
 *
 * These stay bundled with the app rather than living in Supabase Storage:
 * they never change per user, they cache forever behind a content hash, and
 * it keeps the page working with no network round trip for images.
 *
 * A missing entry is not an error: RecipeHero falls back to its generated
 * gradient, so a recipe without a photo still looks deliberate.
 */

import alooGobi from '../assets/recipes/aloo-gobi.jpg'
import baingaBharta from '../assets/recipes/baingan-bharta.jpg'
import birriaStyleBeefTacos from '../assets/recipes/birria-style-beef-tacos.jpg'
import blackBeanEnchiladasVerdes from '../assets/recipes/black-bean-enchiladas-verdes.jpg'
import butterChicken from '../assets/recipes/butter-chicken.jpg'
import chanaMasala from '../assets/recipes/chana-masala.jpg'
import charredCornBlackBeanTacos from '../assets/recipes/charred-corn-black-bean-tacos.jpg'
import chilesRellenos from '../assets/recipes/chiles-rellenos.jpg'
import crispyChickpeaShakshuka from '../assets/recipes/crispy-chickpea-shakshuka.jpg'
import dalMakhani from '../assets/recipes/dal-makhani.jpg'
import garlicButterShrimpScampi from '../assets/recipes/garlic-butter-shrimp-scampi.jpg'
import lambRoganJosh from '../assets/recipes/lamb-rogan-josh.jpg'
import masalaDosa from '../assets/recipes/masala-dosa.jpg'
import noKneadRosemaryFocaccia from '../assets/recipes/no-knead-rosemary-focaccia.jpg'
import overnightCinnamonRolls from '../assets/recipes/overnight-cinnamon-rolls.jpg'
import palakPaneer from '../assets/recipes/palak-paneer.jpg'
import paneerTikkaMasala from '../assets/recipes/paneer-tikka-masala.jpg'
import pavBhaji from '../assets/recipes/pav-bhaji.jpg'
import rajmaChawal from '../assets/recipes/rajma-chawal.jpg'
import vegetableBiryani from '../assets/recipes/vegetable-biryani.jpg'

export const recipeImages = {
  'aloo-gobi': alooGobi,
  'baingan-bharta': baingaBharta,
  'birria-style-beef-tacos': birriaStyleBeefTacos,
  'black-bean-enchiladas-verdes': blackBeanEnchiladasVerdes,
  'butter-chicken': butterChicken,
  'chana-masala': chanaMasala,
  'charred-corn-black-bean-tacos': charredCornBlackBeanTacos,
  'chiles-rellenos': chilesRellenos,
  'crispy-chickpea-shakshuka': crispyChickpeaShakshuka,
  'dal-makhani': dalMakhani,
  'garlic-butter-shrimp-scampi': garlicButterShrimpScampi,
  'lamb-rogan-josh': lambRoganJosh,
  'masala-dosa': masalaDosa,
  'no-knead-rosemary-focaccia': noKneadRosemaryFocaccia,
  'overnight-cinnamon-rolls': overnightCinnamonRolls,
  'palak-paneer': palakPaneer,
  'paneer-tikka-masala': paneerTikkaMasala,
  'pav-bhaji': pavBhaji,
  'rajma-chawal': rajmaChawal,
  'vegetable-biryani': vegetableBiryani,
}

export default recipeImages
