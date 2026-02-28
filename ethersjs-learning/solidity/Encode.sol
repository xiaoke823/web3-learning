// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "hardhat/console.sol";

contract Encode{

    function testKeccak256() pure external {
        string memory input="Hello, Ethereum!";
        console.logBytes32(keccak256(abi.encodePacked(input)));
    }

    function testEncode() pure external{
        address a=0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        uint256 b=12345;

        bytes memory result=abi.encode(a,b);
        console.logBytes(result);

        (address decodeA,uint256 decodeB) =abi.decode(result, (address,uint256));

        console.logAddress(decodeA);
        console.logUint(decodeB);

        bytes memory package=abi.encodePacked(a,b);
        console.logBytes32(keccak256(package));
    }
}