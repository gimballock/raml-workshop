var express = require('express');
var path = require('path');
var osprey = require('osprey');
var _ = require('underscore');

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

var app = module.exports = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());
app.use(allowCrossDomain);
app.use(express.logger('dev'));

app.set('port', process.env.PORT || 3000);

api = osprey.create('/api/v0.1', app, {
  ramlFile: path.join(__dirname, '/assets/raml/api.raml'),
  logLevel: 'debug',  //  logLevel: off->No logs | info->Show Osprey modules initializations | debug->Show all
  exceptionHandler: {
    InvalidBodyError: function (err, req, res) {
      // Overwriting the default implementation
      res.send (400, "Parse Error: Invalid request body" );
    }
  }
});

if (!module.parent) {
  var port = app.get('port');
  app.listen(port);
  console.log('listening on port ' + port);
}

var get_handler = function(req, res) {
    var return_code = 404;
    var return_value = 'Event could not be found';

    if (!_.isUndefined(req.params.eid)) {
        var id = parseInt(req.params.eid, 10);
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
        if (_.has(req.query, 'sort_order')) { 
            events = _.sortBy(events, function(e) { return e.name; });
            if(req.query.sort_order === 'desc')
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

    events.push(requested_event);
    return_code = 201;
    return_value = "New event created with id=" + events.indexOf(requested_event);
    res.send(return_code, { message: return_value } );
};

//Adding business logic to a valid RAML Resource
api.get('/events', get_handler);
api.get('/events/:eid', get_handler);

api.post('/events', post_handler);