var express = require('express');
var http = require('http');
var app = express();
var path = require('path');
var  reload = require('reload');

 var publicDir = path.join(__dirname, 'public');

var server = http.createServer(app);

 
app.use(express.static('src/client'));

app.get('/', function (req, res) {
  //res.send('Hello Worrgrrrrllld!!!');
  res.sendFile(path.join(__dirname, 'src/client', 'index.html'));
});

reload(server, app);

/*app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})*/

server.listen(3000, function(){
  console.log("Web server listening on port " + 3000);
  
});
