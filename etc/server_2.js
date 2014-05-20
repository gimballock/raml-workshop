var _ = require('underscore'),
    restify = require('restify'),
    tv4 = require('tv4'),
    RamlProcessor = require('./raml_processor'),
    Router = require('./router');
    
var raml_path = 'http://api-portal.anypoint.mulesoft.com/platform-d/api/campsite/campsite.raml';

//Example data, this should really come from a database.
var groups = [
    { "name": "Data Mining", "description": "Big data discussion group" },
    { "name": "Node.js", "description": "javascript everywhere!" },
    { "name": "REST Rocks", "description": "representational state transfer" },
    { "name": "RESTful markup languages", "description": "standard formats rock" }
];

var route_tbl = new Router();

var post_handler = function (req, res, next) {
    var requested_group = req.body;
    var return_code, return_value;

    var info = route_tbl.getEntry(req.route.name); //route_info[req.route.name];
    var schema = info.method.body['application/json'];

    var valid = tv4.validate(requested_group, schema);
    if (valid) {
        groups.push(requested_group);
        return_code = 201;
        return_value = "New group created with id=" + groups.indexOf(requested_group);
    } else {
        var err = tv4.error;
        return_code = 400;
        return_value = err.message + " for property" + err.dataPath;
    }

    res.send(return_code, return_value);
    next();
};
route_tbl.createEntry('postgroups', post_handler);

var get_handler = function (req, res, next) {
    var return_code = 404;
    var return_value = 'group could not be found';

    if (!_.isUndefined(req.params.id)) {
        var id = req.params.id;
        if (_.has(groups, id)) {
            return_value = groups[id];
            return_code = 200;
        }
    } else {
        return_value = groups;
        return_code = 200;
    }
    res.send(return_code, return_value);
    next();
};
route_tbl.createEntry('getgroups', get_handler);
route_tbl.createEntry('getgroupsid', get_handler);

//Server object we will attach all our REST calls to
var server = restify.createServer();
server.use(restify.CORS());
server.use(restify.acceptParser('application/json'));
server.use(restify.bodyParser());

var route_methods = function (method_context, resource_context) {
    var method = method_context.method; //e.g. GET, POST, DELETE
    var uri = resource_context.uri; // full uri path to this resource

    //Generate a route name we can retrieve from restify from 'method' + 'uri'
    // stripped of symbols including slashes and converting to lower case 
    //(e.g. POST /example/uri/{id} --> postexampleuriid)
    var route_name = (method + uri.replace(/\W/g,'')).toLowerCase();

    //Look up routing entry for this route name
    var info = route_tbl.getEntry(route_name); // route_info[route_name];
    if(_.isUndefined(info) || _.isUndefined(info.callback))
      return;
    
    //Save info for later use by by callbacks
    info.resource = resource_context;
    info.method = method_context;

    // Change uri parameter syntax for restify:
    // expects ':' prefix instead of surrounding curly brace. 
    uri = uri.replace(/\{(\w*)\}/g,':$1');

    //Register callback to restify
    server[method](uri, info.callback);
    console.log("Registered: " + route_name + " at " + uri + " for method " + method);
};

var processor = new RamlProcessor(raml_path);
processor.run(route_methods);

server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});