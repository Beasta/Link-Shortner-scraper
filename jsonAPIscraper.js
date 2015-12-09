var request = require('request');
var fs = require('fs');
var zlib = require('zlib');
var counter = 3;
var maxCounter = 6;
var theDelay = 2;//in seconds
var everything = [];


var requestWithEncoding = function(options, callback) {
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

function requestCallback(error, response, body) {
  if (!error ) {
    // console.log('\noptions.url:',options.url);
    console.log('\nbody:',body,'\nresponse:',response);//,'\noptions.counter:',options.counter);
    everything.push(response);
    var curID;
    if(response){
      curID = JSON.parse(response).id;
      fs.writeFile("./pages/"+curID, response, function(err) {
        // console.log('response.id',JSON.parse(response).id);
      // fs.writeFile("./pages/"+Math.floor(Math.random()*10000)/*process.argv[3]*/, response, function(err) {
          if(err) {
              return console.log('error saving file',err);
          }
          console.log("The file was saved!");
      }); 
    } else {
      console.log('an empty user');
    }
  }else {
    console.log('Error requesting page:',error);
  }
}


var aRequest= function(){
  var options = {
    'counter':counter,
    url: 'http://something.something.com/api/v1/user/getCurrent/'+counter,
    headers: {
      'Accept':'application/json, text/plain, */*',
      'Accept-Encoding':'gzip, deflate, sdch',
      'Accept-Language':'en-US,en;q=0.8',
      'Connection':'keep-alive',
      //'Cookie':'
      'DNT':'1',
      //'Host':'something.something.com',
      'If-None-Match':"-344847488",
      //'Referer':'http://something.something.com/',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
    }
  };
  console.log('counter in loop:',options.counter);
  requestWithEncoding(options, requestCallback);
  counter++;
  console.log('counter is:',counter);
  if(counter === 1339){
    fs.writeFile("./pages/everything", everything, function(err) {
      // console.log('response.id',JSON.parse(response).id);
    // fs.writeFile("./pages/"+Math.floor(Math.random()*10000)/*process.argv[3]*/, response, function(err) {
        if(err) {
            return console.log('error saving file',err);
        }
        console.log("The everything file was saved!");
        clearInterval(requestAll);
    });
  }
};

var requestAll = setInterval(aRequest,theDelay*2000);
