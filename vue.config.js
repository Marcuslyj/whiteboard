const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    externals:{
        pdfjsLib:'pdfjsLib'
    },
    plugins: (
      process.env.NODE_ENV === 'production' ?
        [
          new CompressionPlugin({
            minRatio: 0.8,
          })
        ] : []
    ).concat(
        new CopyWebpackPlugin([
            {
              from:__dirname+'/assets',
              to:__dirname+'/dist/assets'
            }
          ])
    )
  },

}