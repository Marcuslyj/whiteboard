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
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 'off',
    'semi': [2, 'never'],
    'no-use-before-define': 0,
    'no-var': 1,
    'no-multi-assign': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'import/extensions': 0,
    'no-plusplus': 0,
    'no-mixed-spaces-and-tabs': 2,
    'indent': ['error', 2],
    'linebreak-style': [0, 'error', 'windows'],
    'no-underscore-dangle': 0,
    'func-names': 0,
    'no-unused-expressions': 0,
    'no-restricted-properties': 0,
    'max-len': 0,
    'no-param-reassign': 0,
    'prefer-const': 0,
    'no-nested-ternary': 0,
    'import/no-unresolved': [2, { 'ignore': ['konva']}],
    'array-callback-return': 0,
    'prefer-arrow-callback': 0,
    'no-restricted-syntax':0,
    'no-prototype-builtins':0,
    'no-bitwise':0,
    'no-restricted-globals':0,
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }],
    'no-unused-vars':1,
    'radix':0,
  },
  'parserOptions':{
    parser: 'babel-eslint',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ]
};
