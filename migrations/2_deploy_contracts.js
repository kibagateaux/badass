const ENS = artifacts.require("./ENSRegistry.sol");
const ETHRegistrar = artifacts.require('./ETHRegistrarController.sol');
const web3 = new (require('web3'))();
const namehash = require('eth-ens-namehash');

/**
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
  return {
    namehash: namehash(tld),
    sha3: web3.sha3(tld)
  };
}

/**
 * Deploy the ENS and ETHRegistrar
 *
 * @param {Object} deployer truffle deployer helper
 * @param {string} tld tld which the ETH registrar takes charge of
 */
function deployRegistrar(deployer, tld) {
  var rootNode = getRootNodeFromTLD(tld);

  // Deploy the ENS first
  deployer.deploy(ENS)
    .then(() => {
      // Deploy the ETHRegistrar and bind it with ENS
      return deployer.deploy(ETHRegistrar, ENS.address, rootNode.namehash);
    })
    .then(function() {
      // Transfer the owner of the `rootNode` to the ETHRegistrar
      return ENS.at(ENS.address).then((c) => c.setSubnodeOwner('0x0', rootNode.sha3, ETHRegistrar.address));
    });
}


module.exports = function(deployer, network) {
  var tld = 'badass';

  deployRegistrar(deployer, tld);

};
