//Scraper will search a website for valid links that have been shortened. 

var request = require('request'),
  zlib = require('zlib'),
  fs = require('fs'),
  important = require('./importantstuff.js');

var theDelay = 3;
var extension = "";

var headers = {

  "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding":"gzip, deflate, sdch",
  "Accept-Language" : "en-US,en;q=0.8",
  "Connection":"keep-alive",
  "DNT":1,
  "Host":important.site,
  'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.13+(KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36'
};

var options = {
  method: 'GET',
  url: "http://"+ important.site + "/" + extension,
  headers: headers
};

var counter = 599;

var requestWithEncoding = function(options, callback) {

  console.log('counter',counter);
  console.log('typeof callback',typeof callback);

  //extension to be tested is 3 hexadecimal digits
  extension = ( counter++ ).toString(16); 
  if (extension.length === 1){
    extension = "00"+extension;
  }else if(extension.length === 2){
    extension = "0" + extension;
  }

  console.log('extension:',extension);

  options.url = "http://" + important.site + "/" + extension; 

  //for 3 hexadecimal digits counter = 16*16*16 = 4096
  if(counter === 1100){
    console.log('counter has reached '+counter);
    clearInterval(requestAll);
  }

  var req = request.get(options);

  req.on('response', function(res) {
    var chunks = [];

    res.on('data', function(chunk) {
      chunks.push(chunk);
    });

    res.on('end', function() {
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

var theCall = function(){
      requestWithEncoding(
        {
          method: 'GET',
          headers: headers
        },
        function(err, data) {
          if (err) console.log('error',err);
          else{
            if( !(/Page Not Found/.test(data) ) ) { //regex checks the page html to see if anything was found
              fs.writeFile("./pages/"+extension+".html", data, function(err) { //if something was found, save the file in ./pages folder
                if(err) {
                  return console.log('error saving file',err);
                }
              });
            }
        }
      });
};

var requestAll = setInterval(
  theCall,
  theDelay*1000
);