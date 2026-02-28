require("dotenv").config();
const { ethers } = require("ethers");

// Setup connection
const URL = process.env.TENDERLY_RPC_URL;
const provider = new ethers.JsonRpcProvider(URL);

// Define "Application Binary Interface"
// Define "Application Binary Interface"
const ERC20_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function transfer(address _to, uint256 _value) public returns (bool success)",
  "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
];
// Setup contract

const ERC20_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);

const main = async () => {
  // Get block number
  const block = await provider.getBlockNumber();
  // Query events
  const transferEvents = await contract.queryFilter(
    "Transfer",
    block - 1,
    block
  );

  console.log(transferEvents[0]);
};

main();
