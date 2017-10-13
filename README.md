## solidity-static-analysis

The goals of this project is to create a way to add [Remix's](https://github.com/ethereum/browser-solidity/tree/master/src/app/staticanalysis) 
static analysis to your [Truffle](https://github.com/trufflesuite/truffle) workflow.

To get started make sure you are running node `v8.6.0`. The easiest way to do
that is via [nvm](https://github.com/creationix/nvm).


    nvm install v8.6.0
    nvm use v8.6.0
    
Once you have node `v8.6.0` installed run

    npm upgrade
    node analyse SomeContract.sol

Replacing `SomeContract.sol` to the path of your contract.

There are some examples in `./contracts` which you can run with

    node analyse ./contracts/BadCode.sol
    
Or to run all the `.sol` files in a directory

    node analyse --directory ./contracts

Currently the only stand alone contracts are supported but if there is interest
we will support included contracts and libraries.


