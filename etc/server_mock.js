var restify = require('restify'),
    RamlProcessor = require('./raml_processor');

//Server object we will attach all our REST calls to
var server = restify.createServer();
server.use(restify.CORS());
server.use(restify.acceptParser('application/json'));
server.use(restify.bodyParser());

var route_methods = function (method_context, resource_context) {
    var method = method_context.method; //e.g. GET, POST, DELETE
    var uri = resource_context.uri; // full uri path to this resource

    //Attempt to retrieve an example response for the 200 return code
    //create a server callback returning the example or return early
    var example_response = "";
    try {
        example_response = method_context.responses['200'].body['application/json'].example;
        example_response = JSON.parse(example_response);
    } catch (e) { console.log("No mock found for: " + method + " " + uri); }

    var mock_callback = function (req, res, next) {
        res.send(200, example_response);
        next();
    };

    // Change uri parameter syntax for restify:
    // expects ':' prefix instead of surrounding curly brace. 
    uri = uri.replace(/\{(\w*)\}/g, ':$1');

    //Register callback to restify
    server[method](uri, mock_callback);
    console.log("Registered: mock " + method + " " + uri);
};

var processor = new RamlProcessor('./campsite.raml');
processor.run(route_methods);

server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});