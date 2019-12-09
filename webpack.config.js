const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packageData = require('./package.json');


module.exports = {
  entry: {
    admin: ['./admin/app.js', './admin/assets/admin.scss'],
    vendor: ['semantic-ui-css', 'semantic-ui-css/semantic.css', 'jquery']
  },
  output: {
    filename: '[name].bundle.min.js',
    path: path.resolve(__dirname, 'dist/admin/assets')
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: packageData.babel
        }
      },
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract({
          loader: [
            { loader: 'css-loader', options: { minimize: true, sourceMap: true } },
            { loader: 'sass-loader' }
          ],
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          loader: 'css-loader',
          options: { minimize: true, sourceMap: true }
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|ico)(\?|$)/,
        use: {
          loader: 'file-loader',
          options: { name: '[name].[ext]' }
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
      },
      sourceMap: true
    }),
  ]
};
