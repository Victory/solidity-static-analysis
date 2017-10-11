pragma solidity ^0.4.0;


contract SimpleGoodCode {
    address creator;

    function SimpleGoodCode()
    public
    {
        creator = msg.sender;
    }

    function getCreator()
    public
    view
    returns (address)
    {
        return creator;
    }
}
