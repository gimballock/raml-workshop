var restify = require('restify'),
    _ = require('underscore'),
    tv4 = require('tv4');

//Example data, this should really come from a database.
var events = [ 
    { 
      "id":0,
      "name":"APICon SF", 
      "description":"APIcon is a 3-day interactive conference for app developers, existing public API providers, and those currently developing an API strategy.\nFrom May 27-29, 450+ stakeholders in the API economy will gather at the Hilton San Francisco Union Square to learn, create, ideate, and debate while advancing the overall interests of the API economy and all of its constituents. - See more at: http://www.apiconsf.com/#sthash.prwopBLX.dpuf", 
      "location":"750 Kearny St, San Francisco, CA 94108", 
      "starts_at":"2014-05-27",
      "ends_at":"2014-05-29"
    },
    { 
      "id":1,
      "name":"APICon SF 2015", 
      "description":"APIcon is a 5-day interactive conference for app developers, existing public API providers, and those currently developing an API strategy.\nFrom May 27-29, 1000+ stakeholders in the API economy will gather at the Hilton San Francisco Union Square to learn, create, ideate, and debate while advancing the overall interests of the API economy and all of its constituents. - See more at: http://www.apiconsf2015.com/not-a-real-url", 
      "location":"750 Kearny St, San Francisco, CA 94108", 
      "starts_at":"2015-05-27",
      "ends_at":"2015-05-29"
    }
];

var event_schema = {
    "$schema": "http://json-schema.org/draft-04/schema",
    "type" : "object",
    "properties" : {
        "id" : { "type" : "number" },
        "name" : { "type" : "string", "minLength":1 },
        "description" : { "type" : "string" },
        "location" : { "type" : "string" },
        "starts_at" : { "type" : "string" },
        "ends_at" : { "type" : "string" },
    }
};


var get_handler = function(req, res) {
    var return_code = 404;
    var return_value = 'event could not be found';

    if (!_.isUndefined(req.params.eid)) {
        var id = parseInt(req.params.eid, 10) || 0;
        var event = _.find(events, function (event) {
            if(event.id === id)
                return true;
            return false;
        });
        if (!_.isUndefined(event)) {
            return_value = event;
            return_code = 200;
        }
    } else {
        if (_.has(req.params, 'sort_order')) { 
            events = _.sortBy(events, function(e) { return e.name; });
            if(req.params.sort_order === 'desc')
                events = events.reverse();
        }

        return_value = events;
        return_code = 200;
    }
    res.send(return_code, return_value);
};

var post_handler = function (req, res) {
    var requested_event = req.body;
    var return_code, return_value;

    // Currently no way (to my knowledge) to access osprey's validaton service
    // Maybe the reader of this comment will provide that patch?

    var valid = tv4.validate(requested_event, event_schema);
    if (valid) {
        events.push(requested_event);
        return_code = 201;
        return_value = "New event created with id=" + events.indexOf(requested_event);
    } else {
        var err = tv4.error;
        return_code = 400;
        return_value = err.message + " for property" + err.dataPath;
    }
    res.send(return_code, return_value);
};

//Server object we will attach all our REST calls to
var server = restify.createServer();

//Include Access-Control-Allow-Origin from all origins
server.use(restify.CORS());

//Accept requests for JSON responses
server.use(restify.acceptParser('application/json'));

//Parse the request body from the user
server.use(restify.bodyParser());

server.use(restify.queryParser());

//If incoming connection is for <hostname>/events/<some id number> then call function respond()
server.get('/api/v0.1/events', get_handler);
server.get('/api/v0.1/events/:eid', get_handler);
server.post('/api/v0.1/events', post_handler);

//Start listening for connections
server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});
