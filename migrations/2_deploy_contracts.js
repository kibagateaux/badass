const ENS = artifacts.require("@ensdomains/ens/ENSRegistry");
const ETHRegistrar = artifacts.require('@ensdomains/ethregistrar/ETHRegistrarController');
const BaseRegistrar = artifacts.require('@ensdomains/ethregistrar/BaseRegistrarImplementation');
const PriceOracle = artifacts.require('@ensdomains/ethregistrar/StablePriceOracle');
const DummyOracle = artifacts.require('@ensdomains/ethregistrar/DummyOracle');
const web3 = new (require('web3'))();
const namehash = require('eth-ens-namehash');

/**
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
  return {
    namehash: namehash.hash(tld),
    sha3: web3.sha3(tld)
  };
}

/**
 * Deploy the ENS and ETHRegistrar
 *
 * @param {Object} deployer truffle deployer helper
 * @param {string} tld tld which the ETH registrar takes charge of
 */
async function deployRegistrar(deployer, tld) {
  var rootNode = getRootNodeFromTLD(tld);
  // Deploy the ENS first
  await deployer.deploy(ENS);
  // Deploy base registrar and bind with ENS
  await deployer.deploy(BaseRegistrar, ENS.address, rootNode.namehash);
  // Deploy price oracle for ethregistrar
  await deployer.deploy(DummyOracle, 1);
  await deployer.deploy(PriceOracle, DummyOracle.address, [1,2,3,4,5]);
  // Deploy the ETHRegistrar and bind with Base Registrar
  await deployer.deploy(ETHRegistrar, BaseRegistrar, Math.pow(10*20), Math.pow(10*25));
  // Transfer the owner of the `rootNode` to the ETHRegistrar
  return ENS.at(ENS.address).then((registry) =>
    registry.setSubnodeOwner('0x0', rootNode.sha3, ETHRegistrar.address));
}


module.exports = function(deployer, network) {
  var tld = 'badass';

  deployRegistrar(deployer, tld);

};
