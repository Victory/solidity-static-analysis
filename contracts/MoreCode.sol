pragma solidity ^0.4.0;


contract MoreCode {
    uint contractValue;
    address creator;
    function MoreCode()
    public
    payable
    {
        contractValue = msg.value;
        creator = msg.sender;
    }

    function reallyBadFunction()
    public
    {
        creator.transfer(contractValue / 2);
        contractValue = contractValue / 2;
    }
}
