const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function (env, argv) {
  return {
    entry: {
      lib: "./src/index.ts",
      app: "./src/app.ts"
    },
    mode: "development",
    devtool: "source-map",
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, "dist")
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"]
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: [{ loader: "ts-loader" }], exclude: [/node_modules/] },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader", exclude: [/node_modules/] }
      ]
    },
    node: {
      fs: 'empty'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'YanuX Coordinator Proving Grounds',
        // Load a custom template (lodash by default see the FAQ for details)
        template: 'src/index.html',
        chunks: ['app'],
        inject: 'head'
      }),
      new CopyPlugin([{
        from: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
      }])
    ]
  }
};