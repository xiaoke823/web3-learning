import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";

import fullLogo from "../full_logo.png";

const usedChainId = "0x7a69"; // localhost

function Navbar() {
  const location = useLocation();

  const [connected, setConnected] = useState(false);
  const [currAddress, setCurrAddress] = useState("");

  const getAddress = async () => {
    // TODO:
    // 1. 检查 window.ethereum
    if(!window.ethereum){
        throw new Error('请安装小狐狸钱包')
    }
    // 2. 创建 provider
    const provider = new ethers.BrowserProvider(window.ethereum)
    // 3. 获取 signer
    const signer = await provider.getSigner()
    // 4. 获取 address
    const address = await signer.getAddress()
    // 5. setCurrAddress(address)
    setCurrAddress(address)
    // 6. setConnected(true)
    setConnected(true)
  };

  const connectWallet = async () => {
    try {
        // TODO:
        // 1. 检查 window.ethereum
        if(!window.ethereum){
            throw new Error('请安装小狐狸钱包')
        }
        // 2. 获取 chainId
        const chainId = await window.ethereum.request({
            method:'eth_chainId'
        })
        // 3. 如果 chainId !== usedChainId，切换链
        if(chainId !== usedChainId){
            await window.ethereum.request({
                method:'wallet_switchEthereumChain',
                params:[{chainId:usedChainId}]
            })
        }
        // 4. 请求账户授权
        await window.ethereum.request({method:'eth_requestAccounts'})
        // 5. 调用 getAddress()
        await getAddress()
    } catch (error) {
        console.error(error)
    }
  };

  useEffect( () => {
    // TODO:
    // 1. 如果没有 window.ethereum，直接 return
    if(!window.ethereum){
        return 
    }
    // 2. 写一个 checkConnection 函数
    //    - 调用 eth_accounts
    //    - 如果有账户，更新 currAddress 和 connected
    const checkConnection = async()=>{
        try{
            const accounts = await window.ethereum.request({
                method:'eth_accounts'
            })
            if(accounts.length>0){
                setCurrAddress(accounts[0])
                setConnected(true)
            }else {
                setCurrAddress('')
                setConnected(false)
            }
        }catch(err){
            console.log('链接钱包失败')
        }
    }
    // 3. 写一个 handleAccountsChanged 函数
    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
        setCurrAddress(accounts[0]);
        setConnected(true);
        } else {
        setCurrAddress("");
        setConnected(false);
        }
    };

    // 4. 绑定事件监听
    checkConnection();
    window.ethereum.on('accountsChanged',handleAccountsChanged)
    // 5. cleanup 里移除监听
    return ()=>{
        window.ethereum.removeListener('accountsChanged',handleAccountsChanged)
    }
  }, []);

  const navLinkClass = (link) =>
    location.pathname === link
      ? "border-b-2 p-2"
      : "p-2 hover:border-b-2";

  const buttonClass = connected
    ? "rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
    : "rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700";

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">
              <img src={fullLogo} alt="NFT Marketplace Logo" />
              <div>NFT Marketplace</div>
            </Link>
          </li>

          <li>
            <ul>
              <li className={navLinkClass("/")}>
                <Link to="/">Marketplace</Link>
              </li>

              <li className={navLinkClass("/sellNFT")}>
                <Link to="/sellNFT">Sell NFT</Link>
              </li>

              <li className={navLinkClass("/profile")}>
                <Link to="/profile">Profile</Link>
              </li>

              <li>
                <button className={buttonClass} onClick={connectWallet}>
                  {connected ? "Connected" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <div>
        {connected
          ? `Connected to ${currAddress.slice(0, 6)}...${currAddress.slice(-4)}`
          : "Not connected. Please connect your wallet."}
      </div>
    </div>
  );
}

export default Navbar;