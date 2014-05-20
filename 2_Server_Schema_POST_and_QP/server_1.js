var restify = require('restify'),
    tv4 = require('tv4'),
    _ = require('underscore');

//Example data, this should really come from a database.
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

//Include Access-Control-Allow-Origin from all origins
server.use(restify.CORS());

//Accept requests for JSON responses
server.use(restify.acceptParser('application/json'));

//If incoming connection is for <hostname>/groups/<some id number> then call function respond()
server.get('/api/v0.1/groups', get_handler);
server.get('/api/v0.1/groups/:id', get_handler);

//Start listening for connections
server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});
