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
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi':[2,'never'],
    'no-use-before-define':0,
    'no-var':1,
    'no-multi-assign':0,
    'import/prefer-default-export':0,
    'import/no-unresolved':[2,{ 'ignore': ['Konva'] }]
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
