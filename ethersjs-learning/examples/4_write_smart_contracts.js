require("dotenv").config();
const { ethers } = require("ethers");

// Import private key helper
const { promptForKey } = require("../helpers/prompt.js");

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
  "function transfer(address _to, uint256 _value) public returns (bool success)",
];

// Setup contract
const ERC20_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const contract = new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, provider);

const RECIEVER = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";

async function main() {
  const privateKey = await promptForKey();
  // Setup wallet
  const wallet = new ethers.Wallet(privateKey, provider);
  // Get ERC20 balances
  const senderBalanceBefore = await contract.balanceOf(wallet.address);
  const recieverBalanceBefore = await contract.balanceOf(RECIEVER);
  // Log ERC20 balances
  console.log(`\nReading from ${ERC20_ADDRESS}\n`);
  console.log(`Sender balance before: ${senderBalanceBefore}`);
  console.log(`Reciever balance before: ${recieverBalanceBefore}`);
  // Setup amount to transfer
  const decimals = await contract.decimals();
  const AMOUNT = ethers.parseUnits("0.5", decimals);

  // Create transaction
  const transaction = await contract.connect(wallet).transfer(RECIEVER, AMOUNT);
  // Wait transaction
  await transaction.wait();
  // Log transaction
  console.log(transaction);
  // Get ERC20 balances
  const senderBalanceAfter = await contract.balanceOf(wallet.address);
  const recieverBalanceAfter = await contract.balanceOf(RECIEVER);
  // Log ERC20 balances
  console.log(`Sender balance After: ${senderBalanceAfter}`);
  console.log(`Reciever balance After: ${recieverBalanceAfter}`);
}

main();
