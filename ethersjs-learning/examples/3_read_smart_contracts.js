require("dotenv").config();
const { ethers } = require("ethers");
// Setup connection
const URL = process.env.TENDERLY_RPC_URL;
const provider = new ethers.JsonRpcProvider(URL);
// Define "Application Binary Interface"
const ERC20_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
];

// Setup contract
const ERC20_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);

async function main() {
  // Get contract state
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  // Log contract state
  console.log(`\nReading from ${ERC20_ADDRESS}\n`);
  console.log(`Name:${name}`);
  console.log(`Symbol:${symbol}`);
  console.log(`Decimals:${decimals}`);
  console.log(`Total Supply:${totalSupply}`);
  // Get ERC20 balance
  const USER_ADDRESS = "0x06e668133d7f3ee7dbc2b5371f71e443ea173693";
  const balance = await contract.balanceOf(USER_ADDRESS);

  // Log ERC20 balance
  console.log(`Balance Returned:${balance}`);
  console.log(`Balance Formatted: ${ethers.formatUnits(balance, decimals)}`);
}

main();
