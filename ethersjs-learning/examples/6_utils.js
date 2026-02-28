const { ethers } = require("ethers");

function generateAccount() {
  // 1. 创建随机钱包
  const randomWallet = ethers.Wallet.createRandom();
  console.log("Private Key:", randomWallet.privateKey); // 0x...64个十六进制字符
  console.log("Address:", randomWallet.address); // 0x...40个十六进制字符

  // 2. 从私钥创建钱包
  const privateKey = randomWallet.privateKey; // 你的64字符私钥
  const walletFromPrivateKey = new ethers.Wallet(privateKey);
  console.log("Address from private key:", walletFromPrivateKey.address);
}

function addressValidate() {
  const address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

  // 检查地址格式是否有效
  if (ethers.isAddress(address)) {
    // 格式化为EIP-55标准混合大小写格式
    const formattedAddress = ethers.getAddress(address);
    console.log("Formatted Address (EIP-55):", formattedAddress);
    // 输出示例: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
  } else {
    console.log("Invalid address format.");
  }
}

function unitConvert() {
  // Ether 转换为 Wei
  const ethValue = "1.5";
  const weiValue = ethers.parseEther(ethValue);
  console.log(`${ethValue} ETH = ${weiValue.toString()} Wei`);

  // Wei 转换为 Ether
  const bigWeiValue = ethers.getBigInt("1500000000000000000");
  const convertedEthValue = ethers.formatEther(bigWeiValue);
  console.log(`${bigWeiValue.toString()} Wei = ${convertedEthValue} ETH`);

  // 使用Gwei进行转换 (常用于Gas)
  const gweiValue = "20";
  const weiFromGwei = ethers.parseUnits(gweiValue, "gwei");
  console.log(`${gweiValue} Gwei = ${weiFromGwei.toString()} Wei`);

  const formattedGwei = ethers.formatUnits(weiFromGwei, "gwei");
  console.log(`${weiFromGwei.toString()} Wei = ${formattedGwei} Gwei`);
}

function hashCodes() {
  // 计算 Keccak-256 哈希
  const data = "Hello, Ethereum!";
  const hash = ethers.keccak256(ethers.toUtf8Bytes(data));
  console.log("Keccak-256 Hash:", hash);

  // ABI 编码与解码
  const someAddress = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
  const someNumber = 12345;

  // 编码
  const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256"],
    [someAddress, someNumber]
  );
  console.log("Encoded Data:", encodedData);

  // 解码
  const decodedData = ethers.AbiCoder.defaultAbiCoder().decode(
    ["address", "uint256"],
    encodedData
  );
  console.log("Decoded Address:", decodedData[0]);
  console.log("Decoded Number:", decodedData[1].toString());

  // 计算紧打包编码的哈希
  const packedHash = ethers.solidityPackedKeccak256(
    ["address", "uint256"],
    [someAddress, someNumber]
  );
  console.log("Packed Keccak-256 Hash:", packedHash);
}

hashCodes();
