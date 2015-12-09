var fs = require('fs');
var zlib = require('zlib');

var gzipped = (fs.readFileSync('./pages/something'));

var buffer = new Buffer(gzipped,'base64');
zlib.unzip(buffer, function(err, buffer) {
  if (!err) {
    console.log(buffer.toString());
  }else{
    console.log('error doing unzip',err);
  }
});