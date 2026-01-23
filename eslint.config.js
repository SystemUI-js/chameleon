import reactConfig from '@system-ui-js/development-base/eslint.react.config.js'

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.worktrees/',
      '.vscode/',
      '.idea/'
    ]
  },
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
