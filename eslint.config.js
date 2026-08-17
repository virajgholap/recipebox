import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * Lint exists here for one specific reason: a reference to a variable that had
 * been removed from a destructuring shipped to production and took the whole
 * page down with "isConfigured is not defined". Tests did not catch it because
 * it was in a component, and the build did not catch it because bundlers do
 * not resolve identifiers.
 *
 * no-undef does. That is the rule earning its keep — the rest is hygiene.
 */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },

  js.configs.recommended,

  // Browser code.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // The rule this whole config exists for.
      'no-undef': 'error',

      // These come from the React Compiler ruleset. We do not run the compiler,
      // so they are advice about future optimisability rather than defects —
      // useful to see, not worth failing a build over. Anything that is an
      // actual correctness rule (immutability, rules-of-hooks) stays an error.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },

  // Node code: the serverless function and the build scripts.
  {
    files: ['api/**/*.js', 'scripts/**/*.mjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Tests.
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]
