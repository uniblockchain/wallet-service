'use strict';

var baseConfig = require('../config');
var events = require('events');
var inherits = require('inherits');
var log = require('npmlog');
var nodeutil = require('util');
var $ = require('preconditions').singleton();

log.debug = log.verbose;
log.disableColor();

function MessageBroker(config) {
  var self = this;
  config = config || baseConfig;

  if (config.messageBrokerServer) {
    var url = config.messageBrokerServer.url;
    this.remote = true;
    this.mq = require('socket.io-client').connect(url);
    this.mq.on('connect', function() {});
    this.mq.on('connect_error', function() {
      log.warn('Error connecting to message broker server @ ' + url);
    });

    this.mq.on('msg', function(data) {
      self.emit('msg', data);
    });

    log.info('Using message broker server at ' + url);
  }
};

nodeutil.inherits(MessageBroker, events.EventEmitter);

MessageBroker.prototype.send = function(data) {
  if (this.remote) {
    this.mq.emit('msg', data);
  } else {
    this.emit('msg', data);
  }
};

MessageBroker.prototype.onMessage = function(handler) {
  this.on('msg', handler);
};

module.exports = MessageBroker;
