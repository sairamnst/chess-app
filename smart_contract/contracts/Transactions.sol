//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Transactions {
    uint256 transactionCount; //no of transactions

    event Transfer(address from,address receiver,uint amount,string message,uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword; 
    }

    TransferStruct[] transactions; //array of structures of type TransferStruct named transactions

    function addToBlockchain(address payable receiver,uint amount,string memory message,string memory keyword) public {
        transactionCount+=1;
        transactions.push(TransferStruct(msg.sender,receiver,amount,message,block.timestamp,keyword));
        //to make transfer we are emitting the event
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }
    function getAllTransactions() public view returns (TransferStruct[] memory){
        return transactions;
    }
    function getAllTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}