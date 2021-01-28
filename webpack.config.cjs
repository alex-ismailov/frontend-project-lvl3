const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, './src'),
  dist: path.resolve(__dirname, 'dist'),
  assets: 'assets/',
};

module.exports = {
  // target: process.env.NODE_ENV === "development" ? "web" : "browserslist",
  target: 'web',
  entry: {
    main: PATHS.src,
  },
  output: {
    path: PATHS.dist,
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { sourceMap: true }
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // TODO: Move to webpack.dev.conf.js !!! ***
    // Site map is private
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    }),
    // ***********************************
    new HtmlWebpackPlugin({
      template: `${PATHS.src}/index.html`,
    }),
  ],
  
  devServer: {
    contentBase: PATHS.dist,
    compress: true,
    port: 9000,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
};
