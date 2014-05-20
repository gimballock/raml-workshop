var _ = require('underscore');

//Constructor
var Router = function () {
    this.table = {};
};

module.exports = Router;

Router.prototype.createEntry = function (name,  callback) {
    this.table[name] = { 'callback' : callback };
};

Router.prototype.getEntry = function (name) {
    return this.table[name];
};