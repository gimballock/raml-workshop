// Load the http module to create an http server.
var http = require('http'),
    restify = require('restify'),
    raml = require('raml-parser'),
    __ = require('underscore');

var raml_path = 'http://api-portal.anypoint.mulesoft.com/platform-d/api/campsite/campsite.raml';
var mock_host = "localhost";
var mock_port = 8000;

var mock_fail = function (res, next, reason) {
    res.send(400, reason);
    return next();
};

var create_callback = function (code, body) {
    return function (req, res, next) {
        res.send(code, body);
        return next();
    };
};

var start_mock_server = function (raml) {

    //create the mock api server
    var server = restify.createServer({
        name : mock_host
    });

    //for each resource defined in the raml file
    __.each(raml.resources, function (resource) {
        var relativeUri = resource.relativeUri;

        //for each supported method on that resource
        var methods = resource.methods;
        __.each(methods, function (m) {
            //var protocols = m.protocols;
            var method = m.method;
            var responses = m.responses;
            var qps = m.queryParameters;

            //Does this method contain a numeric response code
            __.each(responses, function (response, code) {
                var numeric_code = parseInt(code, 10);
                if (!__.isNumber(numeric_code)) { return false; }

                var json_body;
                try {
                    var example_raw = response.body['application/json'].example;
                    json_body = JSON.parse(example_raw);

                    var callback = create_callback(numeric_code, json_body);

                    //add route handler
                    var route = "/" + numeric_code + relativeUri;
                    server[method](route, callback);
                } catch (e) {
                    console.log('Error: ' + e);
                }
            });
        });
    });

    server.listen(mock_port, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
};


raml.loadFile(raml_path).then(
    function (raml_data) {
        start_mock_server(raml_data);
    },
    function (error) {
        console.log('Error parsing: ' + error);
    }Q
);