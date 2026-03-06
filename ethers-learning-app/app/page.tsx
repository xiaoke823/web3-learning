'use client';
import { ethers,parseUnits,formatUnits,parseEther,formatEther } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | ethers.JsonRpcProvider>();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [balance1,setBalance1] = useState<string>('0');
  const [balance2,setBalance2] = useState<string>('0');
  const [blockNum, setBlockNum] = useState<number>(0)
  const [transactionCount, setTransactionCount] = useState<number>(0)

  useEffect(() => {
    let signer = null;

    let provider;

    const setupProvider = async () => {
      if ((window as any).ethereum == null) {

        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed,
        // so they only have read-only access
        console.log("MetaMask not installed; using read-only defaults")
        provider = ethers.getDefaultProvider()
        
        setProvider(provider);

      } else {

        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        provider = new ethers.BrowserProvider((window as any).ethereum)
        setProvider(provider);
        const network = await provider.getNetwork()
        console.log('network',network)
        // It also provides an opportunity to request access to write
        // operations, which will be performed by the private key
        // that MetaMask manages for the user.
        signer = await provider.getSigner();
        setSigner(signer);
      }
    }
    setupProvider();
  }, []);


  // Convert user-provided strings in ether to wei for a value
  const eth = parseEther("1.0")
  // 1000000000000000000n

  // Convert user-provided strings in gwei to wei for max base fee
  const feePerGas = parseUnits("4.5", "gwei")
  // 4500000000n

  // Convert a value in wei to a string in ether to display in a UI
  const formatEth = formatEther(eth)
  // '1.0'

  // Convert a value in wei to a string in gwei to display in a UI
  const formatFeePerGas = formatUnits(feePerGas, "gwei")
  // '4.5'


  async function sendTransaction() {
    // When sending a transaction, the value is in wei, so parseEther
    // converts ether to wei.
    const tx = await signer?.sendTransaction({
      to: "0x2fc90dF00B468e8335b9cd0C68D3788d2A776dFe",
      value: parseEther("0.0001")
    });

    // Often you may wish to wait until the transaction is mined
    const receipt = await tx?.wait();
    console.log('receipt', receipt);
  }

  async function getBalance() {
    // 查询指定的钱包地址
    const balance1 = await provider?.getBalance('0x2C39704f3504ac2CF45Ad2D9C048c524FDd86D9A')
    const balance2 = await provider?.getBalance(signer?.address||'')
    setBalance1(formatEther(balance1) || '0')
    setBalance2(formatEther(balance2) || '0')
  }
  
  async function getBlockNumber() {
    const blockNum = await provider?.getBlockNumber();
    console.log('blockNum',blockNum)
    setBlockNum(blockNum || 0)
  }

  // 获取交易次数，防止重复交易
  async function getTransactionCount() {
    // Get the next nonce required to send a transaction
    const transactionCount = await provider?.getTransactionCount('0x2C39704f3504ac2CF45Ad2D9C048c524FDd86D9A')
    console.log('transactionCount',transactionCount)
    setTransactionCount(transactionCount || 0)
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div>hello world</div>
      <div>provider: {provider? JSON.stringify(provider) : "no provider"}</div>
      <div> signer: {signer? JSON.stringify(signer) : "no signer"}</div>
      <div>eth:{eth}</div>
      <div>feePerGas:{feePerGas}</div>
      <div>formatEth:{formatEth}</div>
      <div>formatFeePerGas:{formatFeePerGas}</div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={sendTransaction}>sendTransaction</button>
      <br/>
      <br/>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getBalance}>getBalance</button>
      <div>balance1:{balance1}</div>
      <div>balance2:{balance2}</div>
      <br/>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getBlockNumber}>getBlockNumber</button>
      <div>blockNum:{blockNum}</div>
      <br/>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getTransactionCount}>getTransactionCount</button>
      <div>transactionCount:{transactionCount}</div>
    </div>
  );
}
