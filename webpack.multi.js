const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");
const path = require("path");

module.exports = merge(
  {
    mode: "production",
    devtool: "source-map",
    devServer: {
      static: "./dist",
      hot: true,
    },

    entry: { app: "./src/ts/app.ts" },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "./dist"),
      clean: true,
    },

    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [
        // sass module loader
        {
          test: /\.s[ac]ss$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1, modules: true },
            },
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
              },
            },
          ],
          include: /\.module\.s[ac]ss$/,
        },
        // sass global loader
        {
          test: /\.s[ac]ss$/,
          use: [
            //MiniCssExtractPlugin.loader,
            "style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
              },
            },
          ],
          exclude: /\.module\.s[ac]ss$/,
        },
        // img loader
        {
          test: /\.(png|avif|svg|jpg|jpeg|gif)$/i,
          type: "asset",
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: "/node_modules/",
        },
        {
          test: /\.(glsl|vs|fs)$/,
          use: "ts-shader-loader",
        },
      ],
    },
  },
  parts.page({ title: "Demo", path: "./src/index.html" }),
  parts.page({ title: "Strepen", url: "strepen", path: "./src/strepen.html" }),
  parts.page({ title: "Stippen", url: "stippen", path: "./src/stippen.html" }),
  parts.page({ title: "Sterren", url: "sterren", path: "./src/sterren.html" })
);
