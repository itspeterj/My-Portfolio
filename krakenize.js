var https = require('http');

var krakenOpts = {
  url: 'krakensource.s3-website-us-east-1.amazonaws.com',
  lossy: true,
  callback_url: "http://pasteb.in/kraken_results",
  auth: {,
    api_key: '7817bb2c45ab4a3b3c80e3ab467c1f5f',
    api_secret: 'b29816000ee097cd8cc51eb2688bf7ea0cbbd89f'
  },
  s3_store: {
    key: 'AKIAJ6W4VHMIWKHNVM4Q',
    secret: '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',
    bucket: 'krakensource',
    path: "image.jpg",
    acl: "public_read"
  }
};


function krakenize(params, cb){
  params.auth = krakenOpts.auth;
  var jsonData = JSON.stringify(params);

  var options = {
        host: 'api.kraken.io',
        path: '/v1/url',
        method: 'POST',
        headers: {
          'Content-Length': jsonData.length,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
    };
    
    console.log(jsonData,null,2);

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            cb(null, JSON.parse(data));
        });
        res.on('error', cb);
    });

    req.write(jsonData);
    req.end();
}

exports.handler = function (event, context) {
  var srcKey = event.Records[0].s3.object.key;
  krakenOpts.url = "https://s3.amazonaws.com/krakensink/" + srcKey;
  var callsLeft = 3, resultAggregate = '';

  function countDownCallback(err, result){
    callsLeft--;
    resultAggregate += '; '+ JSON.stringify(result);
    if(err){
      context.fail(err);
      return;
    } else if(callsLeft === 0){
      context.succeed(resultAggregate);
    } 
  }

  var params1 = JSON.parse(JSON.stringify(krakenOpts));
  params1.resize = {
    width: 90,
    height: 137,
    strategy: 'auto'
  };
  krakenize(params1, countDownCallback);

  var params2 = JSON.parse(JSON.stringify(krakenOpts));
  params2.resize = {
    width: 132,
    height: 201,
    strategy: 'auto'
  };
  krakenize(params2, countDownCallback);

  var params3 = JSON.parse(JSON.stringify(krakenOpts));
  params3.resize = {
    width: 310,
    height: 468,
    strategy: 'auto'
  };
  krakenize(params3, countDownCallback);
};