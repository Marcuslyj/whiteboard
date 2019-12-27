const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@common': path.resolve(__dirname, './src/common')
      }
    },
    externals: {
      pdfjsLib: 'pdfjsLib'
    },
    devtool: process.env.NODE_ENV === 'production' ? 'none' : 'cheap-eval-source-map',
    plugins: getPlugins()
  },

}

// 获取plugin参数
function getPlugins() {
  // 生产
  let prod = [
    // gzip
    new CompressionPlugin({
      minRatio: 0.8,
    })
  ];
  // 开发
  let dev = [];
  // common
  let common = [
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: __dirname + '/assets',
        to: __dirname + '/dist/assets'
      }
    ])
  ];
  return (process.env.NODE_ENV === 'production' ? prod : dev).concat(common)
}