const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, './src'),
  dist: path.resolve(__dirname, 'dist'),
  assets: 'assets/',
};

module.exports = {
  entry: PATHS.src,
  output: {
    path: PATHS.dist,
    filename: 'index_bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: `${PATHS.src}/index.html`,
    }),
  ],
  devServer: {
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
};
