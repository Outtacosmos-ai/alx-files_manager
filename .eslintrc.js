module.exports = {
  env: {
    node: true, 
    es2020: true,
    jest: true, // Add this line to tell ESLint about Jest globals
  },
  extends: [
    'eslint:recommended', 
    'plugin:jest/all', 
    'plugin:chai-friendly/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['jest'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'jest/valid-expect': 'off',
    'no-undef': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'no-shadow': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops are not allowed',
      },
    ],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
  },
  overrides: [
    {
      files: ['*.js'],
      excludedFiles: 'babel.config.js',
    },
  ],
};

