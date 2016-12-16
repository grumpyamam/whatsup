var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');
var TEST_DIR = path.resolve(__dirname, 'src/client/test');


var config = {
  entry: {
	  test: TEST_DIR + '/index.jsx'/*,
	  app: 	APP_DIR + '/index.jsx'
	  */
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].bundle.js"
  },
  
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : TEST_DIR, /*APP_DIR*/
        loader : 'babel'
      }
    ]
  }
};

module.exports = config;
