import reactConfig from '@system-ui-js/development-base/eslint.react.config.js'

export default [
  ...reactConfig,
  {
    name: 'project/custom',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  }
]
