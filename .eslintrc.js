module.exports = {
  env: {
    node: true, // Enable Node.js globals like process, console, and Buffer
    es2020: true, // Use es2020 for compatibility
  },
  extends: [
    'eslint:recommended', // Basic recommended ESLint rules
    'plugin:jest/all', // If you're using Jest for testing
  ],
  parserOptions: {
    ecmaVersion: 2020, // Set ECMAScript version to 2020
    sourceType: 'module',
  },
  plugins: ['jest'], // Jest plugin for test-related rules
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'max-classes-per-file': 'off', // Allow multiple classes in a file
    'no-underscore-dangle': 'off', // Allow underscores in variable names
    'no-console': 'off', // Allow console statements
    'no-shadow': 'off', // Disable the no-shadow rule
    'no-restricted-syntax': [
      'error', // Customizing restricted syntax rules
      {
        selector: 'ForInStatement',
        message: 'for..in loops are not allowed',
      },
    ],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }], // Check for unused variables
  },
  overrides: [
    {
      files: ['*.js'],
      excludedFiles: 'babel.config.js',
    },
  ],
};

