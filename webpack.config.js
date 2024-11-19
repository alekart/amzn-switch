const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    content: './src/content.ts',
    popup: './src/popup.tsx',
    service_worker: './src/service_worker.ts',
    'content-style': './src/styles/content.scss',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    // Copy static assets from `public` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '*',
          context: 'src',
        },
        {
          from: 'icons/*',
          context: 'src',
        },
      ],
    }),
  ],
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
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
              sourceMap: true,
              webpackImporter: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    open: true,
    hot: false,
    static: [{
      directory: path.join(__dirname, 'dist'),
    }, {
      directory: path.join(__dirname, 'dist'),
    }],
    port: 9000,
  },
};
