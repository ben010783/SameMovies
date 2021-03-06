
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.compareForm = function(req, res){
  res.render('compare', { title: 'Compare movies', section: 'movies', action: 'compare', results: null });
};

exports.compare = function(req, res){ 
  function pathForSearch(term) {
    function replaceAll(find, replace, str) {
      function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }   
      return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
    var path = '/?i=&s=' + replaceAll("  ", " ", term);
    return replaceAll(" ", "+", path);
  }
  function requestError(err) {
    console.error(err+""); 
    console.error("Could not connect to " + options.host);
    res.render('compare', options.page);
  }
  function movieFilter(element) {
    return element.Type === 'movie';
  }
  function parseResults(chunk) {
    var json;
    try {
      json = JSON.parse(chunk).Search;
    }
    catch(e) {
      console.log(e);
    }
    finally {
      return json;
    }
  }
  var terms = [ req.body.first, req.body.second ];
  var options = {
    host: 'www.omdbapi.com',
    port: 80,
    path: '/?i=&s=',
    method: 'POST',
    queries: [ req.body.first, req.body.second ],
    page: { title: 'Compare Movies', section: 'movies', action: 'compare', results: [], terms: terms }
  };

  options.path = pathForSearch(terms[0]);
  var request1 = require('http').request(options, function(response1) {
    response1.setEncoding('utf8');
    response1.on('data', function(chunk1) {
      console.log('url: ' + options.path);
      console.log('body: ' + chunk1);
      options.path = pathForSearch(terms[1]);
      var result1 = parseResults(chunk1);
      if (result1 instanceof Array)
        if (req.body.type === "movie") {
          result1 = result1.filter(movieFilter);
        }
        else {
          result1 = [];
        }
      if (result1 !== undefined && result1.length > 0)
        options.page.results.push(result1);
      else
        options.page.results.push(null);
      var request2 = require('http').request(options, function(response2) {
        response2.setEncoding('utf8');
        response2.on('data', function(chunk2) {
          console.log('url: ' + options.path);
          console.log('body: ' + chunk2);
          var result2 = parseResults(chunk2);
          if (result2 instanceof Array)
            if (req.body.type === "movie") {
              result2 = result2.filter(movieFilter);
            }
            else {
              result2 = [];
            }
          if (result2 !== undefined && result2.length > 0)
            options.page.results.push(result2);
          else
            options.page.results.push(null);
          res.render('compare', options.page);
        });
      });
      request2.on('error', requestError).end();
    });
  });
  request1.on('error', requestError).end();
};
