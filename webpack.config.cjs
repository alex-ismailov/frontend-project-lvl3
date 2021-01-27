const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const PATHS = {
  src: path.join(__dirname, './src'),
  dist: path.join(__dirname, './dist'),
  assets: 'assets/',
};

module.exports = {
  entry: PATHS.src,
  output: {
    path: PATHS.dist,
    filename: 'index_bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${PATHS.src}/index.html`,
    }),
  ]
};
