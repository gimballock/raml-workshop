// Load the http module to create an http server.
var http = require('http'),
    restify = require('restify'),
    RamlProcessor = require('./raml_processor'),
    _ = require('underscore');

var raml_path = 'http://api-portal.anypoint.mulesoft.com/platform-d/api/campsite/campsite.raml';

var processor = new RamlProcessor(raml_path);

var print_resources = function (resource_context, raml_context) {
    // console.log(raml_context.title);
    console.log("\n");
    console.log(resource_context.name);
    console.log(resource_context.uri);
    console.log("====================");
    //console.log(resource_context.methods);
    //console.log(resource_context.path_segments);
};

var print_methods = function (method_context, resource_context, raml_context) {
    console.log(method_context.method);
    console.log(method_context.description);
    console.log('--------------------');
    // console.log(method_context.body);
    // console.log(method_context.responses);
};

processor.run(print_methods, print_resources);