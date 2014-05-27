var restify = require('restify'),
    path = require('path'),
    _ = require('underscore'),
    tv4 = require('tv4');

//Load JSON resources
//Assumes .json extension and located within assets dir
var load_json_file = function (file_name) {
  try {
    return require( path.join(__dirname, '/assets/json/'+file_name+'.json') );
  } catch(err) {
    console.log('JSON file load error: ' + err);
    return {};
  }
}

var events = load_json_file('events');
var event_schema = load_json_file('event_schema');

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
        return_value = { "message" : "New event created with id=" + requested_event.id };
    } else {
        var err = tv4.error;
        return_code = 400;
        return_value = err.message + " for property" + err.dataPath;
    }
    res.send(return_code, return_value );
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
