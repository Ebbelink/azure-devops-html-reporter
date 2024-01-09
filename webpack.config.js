const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  entry: {
    htmlReporter: "./src/htmlReporter.tsx",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
    },
    fallback: {
      "fs": false
    },
  },
  stats: {
    warnings: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          "limit": 100000,
        }
      },
      {
        test: /\.html$/,
        loader: "file-loader"
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "*.html", context: "src/" },
    ]),
    new webpack.SourceMapDevToolPlugin({})
  ]
};