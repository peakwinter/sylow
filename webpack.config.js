const path = require('path');
const packageData = require('./package.json');


module.exports = {
  entry: './admin/assets/admin.js',
  output: {
    filename: 'admin.bundle.js',
    path: path.resolve(__dirname, 'dist/admin/assets')
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, loader: 'babel-loader', options: packageData.babel }
    ]
  }
};
