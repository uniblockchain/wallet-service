'use strict';

var owsCommon = require('@owstack/ows-common');
var AddressManager = require('./addressmanager');
var Constants = owsCommon.Constants;
var sjcl = require('sjcl');
var util = require('util');
var Uuid = require('uuid');
var lodash = owsCommon.deps.lodash;
var $ = require('preconditions').singleton();

var FIELDS = [
  'version',
  'createdOn',
  'xPubKey',
  'id',
  'name',
  'requestPubKeys',
  'customData',
  'addressManager'
];

class Copayer {
  constructor(context) {
    // Context defines the coin network and is set by the implementing service in
    // order to instance this base service; e.g., btc-service.
    context.inject(this);
  }
};

Copayer.create = function(context, opts) {
  opts = opts || {};
  $.checkArgument(opts.xPubKey, 'Missing copayer extended public key')
    .checkArgument(opts.requestPubKey, 'Missing copayer request public key')
    .checkArgument(opts.signature, 'Missing copayer request public key signature');

  opts.copayerIndex = opts.copayerIndex || 0;

  var x = new Copayer(context);

  x.version = 2;
  x.createdOn = Math.floor(Date.now() / 1000);
  x.xPubKey = opts.xPubKey;
  x.id = Copayer._xPubToCopayerId(x.xPubKey);
  x.name = opts.name;
  x.requestPubKeys = [{
    key: opts.requestPubKey,
    signature: opts.signature,
  }];

  var derivationStrategy = opts.derivationStrategy || Constants.DERIVATION_STRATEGIES.BIP45;
  if (AddressManager.supportsCopayerBranches(derivationStrategy)) {
    x.addressManager = AddressManager.create({
      derivationStrategy: derivationStrategy,
      copayerIndex: opts.copayerIndex,
    });
  }

  x.customData = opts.customData;

  return x;
};

Copayer.fromObj = function(context, obj) {
  var x = new Copayer(context);

  lodash.each(FIELDS, function(k) {
    x[k] = obj[k];
  });

  if (obj.addressManager) {
    x.addressManager = AddressManager.fromObj(obj.addressManager);
  }

  return x;
};

Copayer.prototype.toObject = function() {
  var self = this;
  var x = {};
  lodash.each(FIELDS, function(k) {
    x[k] = self[k];
  });
  return x;
};

Copayer._xPubToCopayerId = function(xpub) {
  var hash = sjcl.hash.sha256.hash(xpub);
  return sjcl.codec.hex.fromBits(hash);
};

Copayer.prototype.createAddress = function(wallet, isChange) {
  $.checkState(wallet.isComplete());

  var path = this.addressManager.getNewAddressPath(isChange);
  var address = new this.ctx.Address().derive(wallet.id, wallet.addressType, wallet.publicKeyRing, path, wallet.m, wallet.networkName, isChange);
  return address;
};

module.exports = Copayer;
