const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const PATHS = {
  src: path.join(__dirname, 'src'),
  public: path.join(__dirname, 'public'),
};

module.exports = {
  /* Несмотря на то, что в доке сказано
  target: 'web' <== can be omitted as default is 'web'
  у меня без этого не работает livereload */
  target: 'web',
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: PATHS.src,
  },
  output: {
    path: PATHS.public,
    filename: '[name].js',
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      }
    ],
  },
  devServer: {
    // contentBase: PATHS.public,
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
  ],
};