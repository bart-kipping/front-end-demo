const HtmlWebpackPlugin = require("html-webpack-plugin");

exports.page = ({ title, url = "", chunks, path } = {}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      favicon: "src/favicon.ico",
      publicPath: "/",
      chunks,
      filename: `${url && url + "/"}index.html`,
      context: { title },
      template: path,
    }),
  ],
});
