const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { lib: './src/index.ts', app: './src/app.ts' },
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: ['yanux-coordinator', '[name]'],
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    fallback: {
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      constants: require.resolve('constants-browserify'),
      fs: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/')
    }
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [/node_modules/] },
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: [/node_modules/] },
      { test: /\.svg$/, loader: 'svg-inline-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'YanuX Coordinator Elements',
      template: 'src/index.html',
      chunks: ['app'],
      inject: 'head'
    })
  ]
};