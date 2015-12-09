var request = require('request'),
  zlib = require('zlib'),
  fs = require('fs'),
  important = require('./importantstuff.js');

var theDelay = 2;
var extension = 999;

var headers = {

  "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding":"gzip, deflate, sdch",
  "Accept-Language" : "en-US,en;q=0.8",
  "Connection":"keep-alive",
  "DNT":1,
  "Host":important.site,
  'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.13+(KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36'

  //"accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
  //"accept-language" : "en-US,en;q=0.8",
  //"accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  //"user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
  //"accept-encoding" : "gzip,deflate",
};

var options = {
  method: 'GET',
  url: "http://"+ important.site + "/" + extension,
  headers: headers
};

var requestWithEncoding = function(options, callback) {
  var req = request.get(options);

  req.on('response', function(res) {
    console.log('res.status:',res.statusCode);
    console.log("headers?",res.headers);

    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });

    res.on('end', function() {
      console.log("headers?",res.headers);
      var buffer = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        });
      } else {
        callback(null, buffer.toString());
      }
    });

  });

  req.on('error', function(err) {
    callback(err);
  });
};

requestWithEncoding(options, function(err, data) {
  if (err) console.log(err);
  else{
    fs.writeFile("./pages/"+extension+".html", data, function(err) {
      // console.log('response.id',JSON.parse(response).id);
    // fs.writeFile("./pages/"+Math.floor(Math.random()*10000)/*process.argv[3]*/, response, function(err) {
        if(err) {
            return console.log('error saving file',err);
        }
        console.log("The everything file was saved!");
 //       clearInterval(requestAll);
    });
  }
});

//var requestAll = setInterval(aRequest,theDelay*1000);