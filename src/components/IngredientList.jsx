import { formatQuantity, groupByCategory, ingredientKey } from '../lib/ingredients'
import './IngredientList.css'

/**
 * IngredientList
 *
 * Grouped by aisle, the way Paprika lays out a shopping list, and every line is
 * tappable to strike it through — Mela's trick, and the reason you don't lose
 * your place halfway through measuring.
 *
 * Quantities arrive already scaled; this component only formats them.
 */
export default function IngredientList({ ingredients, checkedKeys = [], onToggle }) {
  const groups = groupByCategory(
    ingredients.map((ingredient, index) => ({ ...ingredient, key: ingredientKey(ingredient, index) })),
  )

  return (
    <div className="ingredient-list">
      {groups.map((group) => (
        <section key={group.category} className="ingredient-list__group">
          <h4 className="ingredient-list__aisle">{group.label}</h4>
          <ul>
            {group.items.map((ingredient) => {
              const isChecked = checkedKeys.includes(ingredient.key)
              return (
                <li key={ingredient.key}>
                  <button
                    type="button"
                    className={`ingredient ${isChecked ? 'ingredient--checked' : ''}`.trim()}
                    aria-pressed={isChecked}
                    onClick={() => onToggle(ingredient.key)}
                  >
                    <span className="ingredient__box" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="11" height="11">
                        <path
                          d="M2.5 8.5l3.5 3.5 7-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="ingredient__amount">
                      {formatQuantity(ingredient.quantity)}
                      {ingredient.unit === 'whole' ? '' : ` ${ingredient.unit}`}
                    </span>
                    <span className="ingredient__item">{ingredient.item}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
