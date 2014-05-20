var restify = require('restify'),
    tv4 = require('tv4'),
    _ = require('underscore');

//Example data, this should really come from a database.
// var groups = [
//     { "id" : "1", "name": "Data Mining", "description": "Big data discussion group" },
//     { "id" : "2", "Node.js", "description": "javascript everywhere!" },
//     { "id" : "3", "name": "REST Rocks", "description": "representational state transfer" },
//     { "id" : "4", "name": "RESTful markup languages", "description": "standard formats rock" }
// ];

var groups = [
    { 
        "id": 20, 
        "name": "CloudCamp", 
        "slug": "cloudcamp", 
        "category": "topic", 
        "parentGroup_id": null 
    },
    { 
        "id": 21, 
        "name": "BigDataCamp", 
        "slug": "bigdatacamp", 
        "category": "topic", 
        "parentGroup_id": null 
    },
    { 
        "id": 161, 
        "name": "CloudCamp SF", 
        "slug": "cloudcampsf", 
        "category": "location", 
        "parentGroup_id": 20 
    },
    { 
        "id": 271, 
        "name": "BigDataCamp LA", 
        "slug": "bigdatacampla", 
        "category": "location", 
        "parentGroup_id": 21 
    },
    { 
        "id": 461, 
        "name": "CloudCamp Sacramento", 
        "slug": "cloudcamp-sacramento", 
        "category": "location", 
        "parentGroup_id": 20 
    }
];

var events = [
    {
        "id": 511,
        "name": "CloudCamp Sacramento",
        "starts_at": "2014-12-31T18:30:00.000Z",
        "ends_at": "2014-12-31T21:00:00.000Z",
        "address1": "Hacker Labs",
        "address2": "Sacramento, CA",
        "group_id" : 461
    },
    {
        "id": 531,
        "name": "BigDataCamp LA 2014",
        "starts_at": "2014-06-14T08:30:00.000Z",
        "ends_at": "2014-06-14T19:00:00.000Z",
        "address1": "12800 Culver Blvd",
        "address2": "Los Angeles, CA 90066",
        "group_id" : 271
    },
    {
        "id": 201,
        "name": "Social Good Hackathon",
        "address1": "901 Mission Street Suite 105",
        "address2": "San Francisco, CA 94103",
        "starts_at": "2014-01-24T19:00:00.000Z",
        "ends_at": "2014-01-26T22:00:00.000Z",
        "group_id": 161
    },
];

var group_schema = {
    "$schema": "http://json-schema.org/draft-04/schema",
    "type" : "object",
    "properties" : {
        "id" : { "type" : "integer" },
        "name" : { "type" : "string", "minLength":1 },
        "slug" : { "type" : "string" },
        "category" : { "type" : "string" },
        "parentGroup_id" : { "type" : "integer" }
    }
};

var post_handler = function (req, res, next) {
    var requested_group = req.body;
    var return_code, return_value;

    var valid = tv4.validate(requested_group, group_schema);
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

//Handle requests from the user. 
//req: contains all the request information
//res: contains the details of our response
//next: allow other handlers to process user request
var get_handler = function (req, res, next) {
    var return_code = 404;
    var return_value = 'group could not be found';

    if (!_.isUndefined(req.params.id)) {
        var id = parseInt(req.params.id, 10);
        var group = _.find(groups, function (group) {
            if(group.id === id)
                return true;
            return false;
        });
        if (!_.isUndefined(group)) {
            return_value = group;
            return_code = 200;
        }
    } else {
        return_value = groups;
        return_code = 200;
    }
    res.send(return_code, return_value);
    next();
};

//Server object we will attach all our REST calls to
var server = restify.createServer();
server.use(restify.CORS());
server.use(restify.acceptParser('application/json'));
server.use(restify.bodyParser());

//If incoming connection is for <hostname>/groups/<some id number> then call function respond()
server.get('/groups', get_handler);
server.get('/groups/:id', get_handler);
server.post('/groups', post_handler);

//Start listening for connections
server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});