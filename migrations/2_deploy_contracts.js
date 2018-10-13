var MercToken = artifacts.require("./MercToken.sol");
var MercTokenSale = artifacts.require("./MercTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(MercToken, 1000000).then(function() {
  	// Token price is 0.001 Ether
  	var tokenPrice = 1000000000000000;
  	return deployer.deploy(MercTokenSale, MercToken.address, tokenPrice);
  });
};
