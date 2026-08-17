# Recipe Box

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

Vite serves on <http://localhost:5173>.

## Stack

React 19 and Vite. No router, no state library, no CSS framework, no backend. State is `useState` in the page component; data is a JavaScript file.

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
| `RecipeCard` | [`src/components/RecipeCard.jsx`](src/components/RecipeCard.jsx) | One recipe in the grid, composed from `Card` and `Badge` |

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

## The data

[`src/data/recipes.js`](src/data/recipes.js) holds twelve recipes, seeded as if a parser had already run. There is no parser. Each recipe carries a full ingredient array:

```js
{ quantity: 6, unit: 'clove', item: 'garlic', category: 'produce' }
```

Categories are aisle-shaped: `produce`, `dairy`, `pantry`, `protein`, `spices`, `bakery`. Ingredients overlap between recipes on purpose — onions, garlic, and olive oil recur throughout.

**Nothing in the UI displays ingredients.** The data is there and unused. That is deliberate.

## Deliberately not built

No second page. No add, edit, or delete. No recipe detail view. No ingredient display. No link parsing or extraction. No search, settings, auth, or image uploads. No dark mode.

One page and a nav is the whole app.

## License

MIT. See [LICENSE](LICENSE).
