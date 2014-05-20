// Load the http module to create an http server.
var http = require('http'),
    raml = require('raml-parser'),
    _ = require('underscore');

//Constructor
var RamlProcessor = function (raml_path) {
    this.raml_path = raml_path;
};
module.exports = RamlProcessor;

//Walk over all the resources in the RAML file calling the resource callback on each one.
//If method callback is provided then for each resource iterate its methods and invoke callback for each method
//Common RAML data is first saved as raml_context: title, version, uri, uri parameters, schema
//Each resource's data is stored in a resource context: uri, name, methods, parameters, etc
//Each method also has it's own context: method name, body, resoinses, headers, query parameters
RamlProcessor.prototype.crawl_parse_tree = function (raml_data, method_callback, resource_callback) {
    var that = this;

    var raml_context = {
        title : raml_data.title,
        version : raml_data.version,
        baseUri : raml_data.baseUri,
        baseUriParameters : raml_data.baseUriParameters,
        schemas : raml_data.schemas
    };

    var process_methods = function (method_callback, resource_context) {
        var methods = resource_context.methods;
        if (_.isUndefined(methods)) {
            return;
        }
        _.each(methods, function (method) {
            var method_context = {
                method : method.method,
                protocols : method.protocols,
                description : method.description,
                body : method.body,
                responses : method.responses,
                headers : method.headers,
                queryParameters : method.queryParameters
            };

            method_callback(method_context, resource_context, that.raml_context);
        });
    };

    var crawl_parse_tree_helper = function (parent_resource, uri) {
        if (!_.has(raml_data, 'resources')) {
            return;
        }

        //for each resource (including sub-resources) collect the details and pass to the callbacks
        _.each(parent_resource.resources, function (child_resource) {
            //save all the details about this resource
            var resource_context = {
                uri : uri + child_resource.relativeUri,
                name : child_resource.displayName || child_resource.relativeUri,
                methods : child_resource.methods,
                path_segments : child_resource.relativeUriPathSegments,
                uriParameters : child_resource.uriParameters
            };

            //provide callback for this resource with the resource details and caller context
            if (_.isFunction(resource_callback)) {
                resource_callback(resource_context, raml_context);
            }

            //for each method pass it's details to the 'method' callback along w/ caller and resource context
            if (_.isFunction(method_callback)) {
                process_methods(method_callback, resource_context);
            }

            //if there are child resources recurse on those
            if (!_.isUndefined(child_resource.resources)) {
                crawl_parse_tree_helper(child_resource, resource_context.uri);
            }
        });
    };

    crawl_parse_tree_helper(raml_data, "");
};

//Load the raml file and crawl the parsed results when done.
RamlProcessor.prototype.run = function (method_callback, resource_callback) {
    var that = this;

    var raml_callback = function (raml_data) {
        that.crawl_parse_tree(raml_data, method_callback, resource_callback);
    };

    raml.loadFile(this.raml_path).then(raml_callback,
        function (error) {
            console.log('Error parsing: ' + error);
        });
};