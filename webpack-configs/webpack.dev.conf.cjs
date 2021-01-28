const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf.cjs');

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  target: 'web',
  devtool: 'eval-source-map',
  devServer: {
    // contentBase: baseWebpackConfig.externals.paths.dist,
    // contentBase: '/',
    compress: true,
    port: 9000,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    }),
  ],
});

module.exports = new Promise((resolve, _reject) => {
  resolve(devWebpackConfig);
});
