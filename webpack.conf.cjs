const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const PATHS = {
  src: path.join(__dirname, './src'),
  public: path.join(__dirname, './public'),
};


module.exports = {
  // Не забыть указать в package.json
  // NODE_ENV=production npx webpack
  // см. hexlet boilerplate
  mode: process.env.NODE_ENV || 'development',
  target: 'web', // ????
  entry: {
    main: PATHS.src,
  },
  output: {
    path: PATHS.public,
    filename: '[name].js',
    // publicPath: '/',
  },
  devtool: 'eval-source-map',// Уточнить чтобы не слить в инет карту сайта
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
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: `index.html`,
    }),
    // Уточнить чтобы не слить в инет карту сайта
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    }),
  ],
};