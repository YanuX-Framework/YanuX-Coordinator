const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { lib: './src/index.ts', app: './src/app.ts' },
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    filename: 'lib.js',
    path: path.resolve(__dirname, 'dist'),
    library: ['yanux-coordinator', '[name]'],
    libraryTarget: 'umd'
  },
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [/node_modules/] },
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: [/node_modules/] },
      { test: /\.svg$/, loader: 'svg-inline-loader' }
    ]
  },
  node: { fs: 'empty' },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'YanuX Coordinator Elements',
      template: 'src/index.html',
      chunks: ['app'],
      inject: 'head'
    })
  ]
};