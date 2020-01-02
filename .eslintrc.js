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
    'semi':[2,'never'],
    'no-use-before-define':0,
    'no-var':1,
    'no-multi-assign':0,
    'import/prefer-default-export':0,
    'import/no-unresolved':[2,{'ignore': ['Konva']}],
    'import/extensions':0,
    'no-plusplus':0,
    "no-mixed-spaces-and-tabs": 2,
    "indent": ["error", 2],
    "linebreak-style": [0,"error", "windows"],
    'no-underscore-dangle':0,
    'func-names':0
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
