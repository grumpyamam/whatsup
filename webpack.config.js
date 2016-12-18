var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');
var STYLE_DIR = path.resolve(__dirname, 'src/client/app/style');
var TEST_DIR = path.resolve(__dirname, 'src/client/test');


var config = {
  entry: {
	  test: TEST_DIR + '/index.jsx',
	  app: 	APP_DIR + '/index.jsx'
	  
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].bundle.js"
  },
  
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR, /*TEST_DIR*/
        loader : 'babel'
      },
	  { 
		test: /\.css$/, 
		loader: "style!css"
	  },
	  /*{
		test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
		loader: 'file-loader'	
	  },*/	  
	  /*this part is for test*/
	  {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
	  {test: /\.(woff|woff2)$/, loader: 'url-loader?prefix=font/&limit=5000'},
	  {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
	  {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
      {
        test : /\.jsx?/,
        include : TEST_DIR,
        loader : 'babel'
      }
	  
    ]
  }
};

module.exports = config;
