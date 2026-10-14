import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/**
 * Minimal stand-in for eslint-plugin-react's `react/no-danger` (that plugin does
 * not support ESLint 10 yet). Flags `dangerouslySetInnerHTML` so each use needs
 * an explicit, reviewed `eslint-disable-next-line react/no-danger`.
 */
const reactLocal = {
  rules: {
    'no-danger': {
      meta: { type: 'problem', messages: { danger: 'Avoid dangerouslySetInnerHTML.' } },
      create: (context) => ({
        JSXAttribute(node) {
          if (node.name.name === 'dangerouslySetInnerHTML') {
            context.report({ node, messageId: 'danger' });
          }
        },
      }),
    },
  },
};

export default tseslint.config(
  { ignores: ['dist', 'src/content/_generated'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks, react: reactLocal },
    rules: {
      // Classic hook rules are hard errors. The React Compiler rules bundled in
      // react-hooks v7 (set-state-in-effect, refs, immutability…) stay as
      // warnings until the existing code is migrated.
      ...Object.fromEntries(
        Object.keys(reactHooks.configs.recommended.rules).map((rule) => [rule, 'warn']),
      ),
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-danger': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
