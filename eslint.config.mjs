import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/artifacts/**',
      '**/.cache/**',
      '**/.firebase/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { module: 'readonly' } },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['apps/mobile/**/*.{ts,tsx,js,mjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^(?:firebase(?:$|/(?!app$|auth$))|firebase-admin(?:/|$)|@google-cloud/|@react-native-firebase/)',
              message: 'Somente Firebase App/Auth no mobile; dados de negócio passam pela API.',
            },
            {
              group: ['**/private-user-data*', '**/server/*', '**/functions/*'],
              message: 'Tipos privados e código de servidor não pertencem ao mobile.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
