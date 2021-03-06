module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'import',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'import/extensions': [0, {}],
    'import/prefer-default-export': [0, {}],
    'max-len': [0, {}],
    'no-shadow': [0, {}],
    '@typescript-eslint/no-shadow': [0, {}],
    '@typescript-eslint/no-unused-vars': [0, {}],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
};
