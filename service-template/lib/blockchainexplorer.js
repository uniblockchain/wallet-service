'use strict';

var cLib = require('../cLib');

var BaseWalletService = require('../../base-service').WalletService;
var BaseBlockchainExplorer = BaseWalletService.BlockchainExplorer;

var Explorer = require('./blockchainexplorers/explorer');
var Networks = cLib.Networks;
var Server = require('./server');

var context = {
	Explorer: Explorer,
	Networks: Networks,
	Server: Server
};

class CBlockchainExplorer extends BaseBlockchainExplorer {
	constructor(opts, config) {
		// Returns a different class.
	  return super(context, opts, config);		
	}
};

module.exports = CBlockchainExplorer;
