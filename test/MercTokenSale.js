var MercTokenSale = artifacts.require("./MercTokenSale.sol");

contract('MercTokenSale', function(accounts) {
	var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; //in wei
  var tokenAvailable = 750000;
  var numberOfTokens;

  it('initializes the contract with the correct values', function() {
     return MercTokenSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.address();
     }).then(function(address) {
      assert.notEqual(address, 0x0, 'has contract address');
      return tokenSaleInstance.address();
     }).then(function(address) {
      assert.notEqual(address, 0x0, 'has token contract address');
      return tokenSaleInstance.tokenPrice();
     }).then(function(price) {
      assert.equal(price, tokenPrice,'token price is correct');
    });
  }); 
  
  it('facilitates token buying', function() {
    return MercTokenSale.deployed().then(function(instance) {
      // Grab token instance first
      tokenSaleInstance = instance;
      return MercTokenSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Provision 75% of all tokens to the token sale
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
    }).then(function(receipt) {  
      numberOfTokens = 10;
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value })
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then(function(amount) {
      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
      // Try to buy tokens deifferent from the ether value
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })  
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei')
      return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })    
    }).then(assert.fail).catch(function(error) {
      assert.(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
    });
  });   
  
  it('ends token sale', function() {
    return MercToken.deployed().then(function(instance) {
      // Grab token instance first
      tokenSaleInstance = instance;
      return MercTokenSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Try to end sale from account other then the admin
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
      // End sale as admin
      return tokenSaleInstance.endSale({ from: admin });    
    }).then(function(receipt) {
      return tokenInstance.balanceOf(admin);  
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 999990, 'returns all unsold merc tokens to admin');
      //Check that token price was reset when selfDestruct was called
      return tokenSaleInstance.tokenPrice();  
    }).then(function(price) {
      assert.equal(price.toNumber(), 0, 'token price was reset');
    });
  });
  
  