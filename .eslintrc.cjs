/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: { version: 'detect' }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  ignorePatterns: ['dist', 'node_modules']
};
