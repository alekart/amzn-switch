const config = require('./webpack.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  ...config,
  mode: 'production',
  devtool: false,
  plugins: [
    ...config.plugins,
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                ['lodash'],
              ],
            },
          },
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              // Prefer `dart-sass`
              implementation: require('sass'),
              sourceMap: false,
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
  },
};
