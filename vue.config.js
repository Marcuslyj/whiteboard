const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  publicPath: './',
  lintOnSave: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@common': path.resolve(__dirname, './src/common'),
      },
    },
    externals: {
      pdfjsLib: 'pdfjsLib',
      konva: 'Konva',
    },
    devtool: process.env.NODE_ENV === 'production' ? 'none' : 'eval-source-map',
    plugins: getPlugins(),
    devServer: process.env.NODE_ENV === 'development' ? {
      https: true,
      disableHostCheck: true,
      proxy: {
        '/file/': {
          target: 'https://dev-file.tvflnet.com',
          changeOrigin: true,
          pathRewrite: {
            '^/file': '/',
          },
        },
        '/api/': {
          target: 'https://dev-whiteboard.tvflnet.com',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '/',
          },
        },
      },
    } : {},
    performance: {
      hints: 'warning',
      // 入口起点的最大体积
      maxEntrypointSize: 500 * 1024,
      // 生成文件的最大体积
      maxAssetSize: 300 * 1024,
    },
  },
}

// 获取plugin参数
function getPlugins() {
  // 生产
  const prod = [
    // gzip
    new CompressionPlugin({
      minRatio: 0.8,
    }),
  ]
  // 开发
  const dev = []
  // common
  const common = [
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: `${__dirname}/assets`,
        to: `${__dirname}/dist/assets`,
      },
    ]),
  ]
  return (process.env.NODE_ENV === 'production' ? prod : dev).concat(common)
}
