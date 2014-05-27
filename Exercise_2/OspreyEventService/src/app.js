var express = require('express');
var path = require('path');
var osprey = require('osprey');
var _ = require('underscore');

var app = module.exports = express();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

//serve up our webpage statically
app.use(express.static(__dirname + '/assets/public'));

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

// -----------------------------------
// Implementation logic
// -----------------------------------

//Load JSON resources
//Assumes .json extension and located within assets dir
var load_json_file = function (file_name) {
  try {
    return require( path.join(__dirname, '/assets/json/'+file_name+'.json') );
  } catch(err) {
    console.log('JSON file load error: ' + err);
    return {};
  }
};

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
  return_value = "New event created with id=" + requested_event.id;
  res.send(return_code, { message: return_value } );
};

//Adding business logic to a valid RAML Resource
api.get('/events', get_handler);
api.post('/events', post_handler);
api.get('/events/:eid', get_handler);
