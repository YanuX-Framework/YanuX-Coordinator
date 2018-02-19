const path = require("path");

module.exports = function (env, argv) {
  return {
    entry: "./src/main.ts",
    devtool: "source-map",
    output: {
      filename: "lib.js",
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
  }
};