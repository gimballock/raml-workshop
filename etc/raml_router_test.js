// Load the http module to create an http server.
var restify = require('restify'),
    RamlProcessor = require('./raml_processor'),
    _ = require('underscore');

var raml_path = 'http://api-portal.anypoint.mulesoft.com/platform-d/api/campsite/campsite.raml';
var PORT = 8000;

var processor = new RamlProcessor(raml_path);

//create the mock api server
var server = restify.createServer();

var route_methods = function (method_context, resource_context) {
    var method = method_context.method; //e.g. GET, POST, DELETE
    var uri = resource_context.uri;
    
    // for each uri parameter change curly braces to colon prefix. 
    uri = uri.replace(/\{(\w*)\}/g,':$1');

    var fake_callback = function(req, res, next) {
      res.send(200, "Hello fake_callback!");
      console.log(resource_context.name + ": " + method + " " + uri);
      return next();
    };
    server[method](uri, fake_callback);
};

processor.run(route_methods);

server.listen(PORT, function () {
    console.log('%s listening at %s', server.name, server.url);
});