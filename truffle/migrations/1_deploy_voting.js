const Voting = artifacts.require('Voting');

module.exports = function(deployer) {
  deployer.then(async () => {
    const accounts = await web3.eth.getAccounts();
    await deployer.deploy(Voting, accounts[0]);  // Passer l'adresse du propriétaire/administrateur ici
  });
};