require("dotenv").config();
const { ethers } = require("ethers");
// Setup connection
const URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
const provider = new ethers.JsonRpcProvider(URL);

const ADDRESS = "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97";

async function main() {
  // Get balance
  const balance = await provider.getBalance(ADDRESS);
  // Log balance

  console.log(
    `\nETH Balance of ${ADDRESS} -> ${ethers.formatUnits(balance, 18)}ETH\n`
  );
}

main();
