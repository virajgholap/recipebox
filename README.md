# Recipe Box

> **Branch note.** `main` is the app exactly as briefed: one page, no detail
> view, ingredients present in the data and invisible in the UI. This branch
> (`feature/recipe-detail`) deliberately breaks that — it adds the recipe detail
> view, cook mode, and dark mode. If you are here for the design-tool
> comparison, you want `main`.

A recipe box for the links you saved and never found again.

Short-form video is how most people discover food now, and the recipe usually only exists inside the video. So everyone has a recipe graveyard: saved reels, screenshots, a bookmark folder nobody opens. Saving was never the hard part. Finding is.

This is the finding half. You paste a link and it becomes a structured card you can filter and sort. One page, twelve recipes, no accounts.

## Running it

```bash
npm install
```

```bash
npm run dev
```

Vite serves on <http://localhost:5173>. It runs with no configuration at all — without Supabase credentials the app uses the bundled seed data and hides the account UI.

To enable accounts and cross-device sync, copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key. Full setup, including Google sign-in, is in [DEPLOYMENT.md](DEPLOYMENT.md).

## Stack

React 19, Vite, React Router, and Supabase for auth and data. No state library, no CSS framework, no UI kit.

Recipes come from Postgres in production and fall back to `src/data/recipes.js` when Supabase is unreachable or unconfigured. Cook progress is per user in Postgres when signed in, and localStorage when not — signing in for the first time carries your local progress up rather than discarding it.

## Routes

| Route | What it is |
| --- | --- |
| `/` | The recipe grid |
| `/recipe/:id` | Same grid with that recipe open — a recipe is a shareable link |
| `/login`, `/signup` | Google or email and password |
| `/auth/callback` | Where Google returns to |

## How the styling works

Every colour, space, radius, and type step is a custom property in [`src/styles/tokens.css`](src/styles/tokens.css). Components read tokens and never hardcode a value. That is the whole system — change a token and it changes everywhere.

Each component owns a CSS file next to it. No inline styles, no one-off classes on the page.

## Components

| Component | File | Notes |
| --- | --- | --- |
| `PageHeader` | [`src/components/PageHeader.jsx`](src/components/PageHeader.jsx) | Title, optional subtitle, optional right-side slot |
| `Card` | [`src/components/Card.jsx`](src/components/Card.jsx) | Surface wrapper; `interactive` adds the hover lift |
| `Button` | [`src/components/Button.jsx`](src/components/Button.jsx) | Variants `primary` and `ghost`; sizes `sm` and `md` |
| `Badge` | [`src/components/Badge.jsx`](src/components/Badge.jsx) | **Takes a `variant` prop** — `success`, `warning`, `info`, `neutral`. Never style a badge from outside |
| `EmptyState` | [`src/components/EmptyState.jsx`](src/components/EmptyState.jsx) | Icon, headline, one line of body, optional action |
| `FilterBar` | [`src/components/FilterBar.jsx`](src/components/FilterBar.jsx) | The tag chip row, multi-select |
| `SortControl` | [`src/components/SortControl.jsx`](src/components/SortControl.jsx) | Labelled native select |
| `Nav` | [`src/components/Nav.jsx`](src/components/Nav.jsx) | App bar |
| `Icon` | [`src/components/Icon.jsx`](src/components/Icon.jsx) | Small inline set, inherits `currentColor` |
| `SegmentedControl` | [`src/components/SegmentedControl.jsx`](src/components/SegmentedControl.jsx) | Two or three exclusive options, all visible |
| `Modal` | [`src/components/Modal.jsx`](src/components/Modal.jsx) | Portalled dialog: scroll lock, focus trap, Escape, bottom sheet under 700px |
| `ThemeToggle` | [`src/components/ThemeToggle.jsx`](src/components/ThemeToggle.jsx) | Writes `data-theme` on the root element |
| `RecipeHero` | [`src/components/RecipeHero.jsx`](src/components/RecipeHero.jsx) | Generated art, seeded from the recipe's `hue` |
| `RecipeCard` | [`src/components/RecipeCard.jsx`](src/components/RecipeCard.jsx) | One recipe in the grid, composed from `Card`, `Badge` and `RecipeHero` |
| `RecipeDetail` | [`src/components/RecipeDetail.jsx`](src/components/RecipeDetail.jsx) | The recipe as something you cook from |
| `IngredientList` | [`src/components/IngredientList.jsx`](src/components/IngredientList.jsx) | Grouped by aisle, checkable |
| `StepList` | [`src/components/StepList.jsx`](src/components/StepList.jsx) | Numbered steps, checkable, dims in cook mode |
| `ServingStepper` | [`src/components/ServingStepper.jsx`](src/components/ServingStepper.jsx) | Rescales every quantity |

## Badges

Badges are derived in [`src/lib/recipes.js`](src/lib/recipes.js), not stored on the data. A recipe is a weekend project because of what it is, not because someone tagged it.

| Badge | Condition | Variant |
| --- | --- | --- |
| Under 30 min | `cookTimeMinutes <= 30` | `success` |
| One pan | `onePan` | `success` |
| Make ahead | `makeAhead` | `info` |
| Weekend project | `cookTimeMinutes >= 120` | `warning` |

## Filtering and sorting

Tag chips are multi-select and combine with **AND**. Picking `Vegetarian` and `Weekend` together returns nothing, which is what the empty state is for — with single-select there is no way to reach it.

Sort is by recently added (default) or cook time.

## The detail view

Click any card. What is in there, and where it came from:

**Ingredients grouped by aisle** — produce, then meat and seafood, dairy, bakery, pantry, spices. That is roughly the walk through a shop rather than alphabetical order, which is the part of Paprika people actually praise. Tap a line to strike it through.

**Cook mode** — borrowed wholesale from Mela. Every step but the current one dims to 32%, the current step grows to 22px, and completing a step advances you to the next. There is a step counter and prev/next in the footer.

**Serving scaling** — change the yield and every quantity rescales, rendered as real fractions (`5¼ tbsp`, not `5.25`). See `formatQuantity` in [`src/lib/ingredients.js`](src/lib/ingredients.js); it only snaps to a fraction within a 0.02 tolerance, so a scale-by-thirds degrades to a decimal instead of lying to you.

**Progress survives a reload** — checked ingredients, completed steps, and your chosen yield are kept in `localStorage` per recipe. Losing your place because your phone locked is the most annoying failure a recipe app has.

**Editorial typography** — serif headline scale over sans body, the NYT Cooking approach: the recipe reads as an article, not a form.

## Dark mode

Every colour is a token, so dark mode is one override block in [`tokens.css`](src/styles/tokens.css) and nothing else. The toggle starts from `prefers-color-scheme` and remembers an explicit choice.

## The data

[`src/data/recipes.js`](src/data/recipes.js) holds twelve recipes, seeded as if a parser had already run. There is no parser. Each recipe carries a full ingredient array:

```js
{ quantity: 6, unit: 'clove', item: 'garlic', category: 'produce' }
```

Categories are aisle-shaped: `produce`, `dairy`, `pantry`, `protein`, `spices`, `bakery`. Ingredients overlap between recipes on purpose — onions, garlic, and olive oil recur throughout.

Each recipe also carries a `blurb`, ordered `steps`, and a `hue` that seeds its generated hero art.

## Photos

Each recipe has a real photograph in `src/assets/recipes/`, sourced from Wikimedia Commons and committed to the repo — so the app still makes no network requests at runtime.

They are **not** MIT like the rest of this repo. Each carries its own CC licence and most require credit. Every one is listed with photographer, licence, and source in [ATTRIBUTION.md](ATTRIBUTION.md). If you swap a photo, update that file in the same commit.

Underneath each photo is the generated gradient, seeded from the recipe's `hue`. It is what shows while the image decodes, and the whole hero for any recipe without a photo — so a missing image degrades to something deliberate rather than a grey box.

## The mix

Twenty recipes: 12 Indian, 4 Mexican, 4 everything else. Sixteen of the twenty are vegetarian — exactly 80%. The four that are not are Butter Chicken, Lamb Rogan Josh, Birria-Style Beef Tacos, and Garlic Butter Shrimp Scampi.

`npm run seed:generate` prints the split, so the counts above are checkable rather than a claim.

## Deliberately not built

No second page. No add, edit, or delete. No link parsing or extraction. No search, settings, auth, or image uploads.

## License

MIT. See [LICENSE](LICENSE).
