const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packageData = require('./package.json');


module.exports = {
  entry: {
    admin: ['./admin/assets/admin.js', './admin/assets/admin.css'],
    vendor: ['semantic-ui-css', 'semantic-ui-css/semantic.css', 'jquery']
  },
  output: {
    filename: '[name].bundle.min.js',
    path: path.resolve(__dirname, 'dist/admin/assets')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: packageData.babel
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          loader: 'css-loader',
          options: { minimize: true }
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/,
        use: {
          loader: 'url-loader',
          options: { limit: 100000, name: '[name].[ext]' }
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.min.js',
    }),
    new ExtractTextPlugin({
      filename: '[name].min.css',
      allChunks: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
      }
    }),
  ]
};
