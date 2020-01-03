module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': 1,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [2, 'never'],
    'no-use-before-define': 0,
    'no-var': 1,
    'no-multi-assign': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'import/extensions': 0,
    'no-plusplus': 0,
    "no-mixed-spaces-and-tabs": 2,
    "indent": ["error", 2],
    "linebreak-style": [0, "error", "windows"],
    'no-underscore-dangle': 0,
    'func-names': 0,
    'no-unused-expressions': 0,
    'no-restricted-properties': 0,
    'max-len': 0,
    'no-param-reassign': 0,
    'prefer-const': 0,
    'no-nested-ternary': 0
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
