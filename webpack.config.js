const path = require("path");

function DtsBundlePlugin() { }
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('done', function () {
    var dts = require('dts-bundle');
    dts.bundle({
      name: "yanux-coordinator",
      main: 'dist/build/main.d.ts',
      out: '../lib.d.ts',
      outputAsModuleFolder: true
    });
  });
};

module.exports = function (env, argv) {
  plugins = [new DtsBundlePlugin()];
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
        { test: /\.tsx?$/, use: [{ loader: "babel-loader" }, { loader: "ts-loader" }], exclude: [/node_modules/] },
        { test: /\.jsx?$/, use: [{ loader: "babel-loader" }], exclude: [/node_modules/] },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader", exclude: [/node_modules/] }
      ]
    },
    plugins: plugins
  }
};