import { defineConfig } from '@eslint/js';
import globals from 'globals';

export default defineConfig({
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect', // Automatically detect the version of React
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
});
