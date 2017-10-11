## solidity-static-analysis

The goals of this project is to create a way to add [Remix's](https://github.com/ethereum/browser-solidity/tree/master/src/app/staticanalysis) 
static analysis to your [Truffle](https://github.com/trufflesuite/truffle) workflow.

To get started make sure you are running node `v8.6.0`. The easiest way to do
that is via [nvm](https://github.com/creationix/nvm).


    nvm install v8.6.0
    nvm use v8.6.0
    
Once you have node `v8.6.0` installed run

    npm install
    node main.js SomeContract.sol

Replacing `SomeContract.sol` to the path of your contract.

Currently the only stand alone contracts are supported but if there is interest
we will support included contracts and libraries.


