module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Import/Export rules
    'no-duplicate-imports': 'error',
    
    // Code quality
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    
    // Formatting (handled by Prettier)
    'max-len': 'off',
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off'
  },
  overrides: [
    {
      // React-specific rules
      files: ['**/*.tsx', '**/*.jsx'],
      extends: ['plugin:react-hooks/recommended'],
      plugins: ['react-hooks'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn'
      }
    },
    {
      // Test files
      files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off' // Allow console in tests for mock data warnings
      }
    },
    {
      // Mock data files
      files: ['tests/mocks/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  }
};