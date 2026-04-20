import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from 'axios'

import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTPage() {
    // 1.先拿路由参数
    const { tokenId } = useParams()
    // 2. 先定义页面状态
    const [nft, setNft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState("");
    const [currentAddress, setCurrentAddress] = useState("");
    // 3.写一个获取合约实例的辅助函数
    const getContract = async () => {
        if (!window.ethereum) {
            throw new Error('请安装小狐狸钱包')
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            signer
        )
        return contract
    }
    // 4加载nft
    const loadNFT = async () => {
        setLoading(true)
        setError('');

        try {
            // 3) 获取 contract / signer / 当前地址
            // const provider = new ethers.BrowserProvider(window.ethereum);
            // const signer = await provider.getSigner();
            // const address = await signer.getAddress()
            // setCurrentAddress(address)
            const contract = await getContract()
            const signer  = contract.runner
            const address  = await signer.getAddress()
            setCurrentAddress(address)
            // 4) 并发获取 tokenURI 和 listedToken
            // const tokenURI = await contract.tokenURI(tokenId)
            // const listedToken = await contract.getListedTokenForId(tokenId)
            const [tokenURI,listedToken] = await Promise.all([
                contract.tokenURI(tokenId),
                contract.getListedTokenForId(tokenId)
            ])
            // 5) 把 ipfs 地址转成 http 地址
            const path = GetIpfsUrlFromPinata(tokenURI);
            // 6) 请求 metadata
            const res = await axios.get(path);
            const metadata = res.data
            const image = GetIpfsUrlFromPinata(metadata.image)
            // 7) 组装 nft 对象
            const nftData = {
                tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                price: ethers.formatEther(listedToken.price),
                image,
                name:metadata.name,
                description:metadata.description
            }
            // 8) setNft(...)
            setNft(nftData)
            // 9) setCurrentAddress(...)
            
        } catch (error) {
            console.error(error)
            setError('加载失败')
        } finally {
            // 10) finally 里 setLoading(false)
            setLoading(false)
        }
    }
    // 5购买nft
    const handleBuyNFT = async () => {
        // TODO:
        // 1) 判断 nft 是否存在
        if(!nft){
            return 
        }
        // 2) setBuying(true)
        setBuying(true)
        try {
            // 3) 获取 contract
            const contract = await getContract()
            // 4) parseEther(nft.price)
            const price = ethers.parseEther(nft.price)
            // 5) 调 executeSale(tokenId, { value })
            const tx = await contract.executeSale(tokenId,{value:price})
            // 6) await tx.wait()
            await tx.wait()
            // 7) 成功后更新 owner 或重新 loadNFT()
            await loadNFT()
        } catch (error) {
            // 8) catch 里处理错误
            
            console.log(error)
            setError('购买失败')
        }finally{
            // 9) finally 里 setBuying(false)
            setBuying(false)
        }
    }
    // 6
    useEffect(() => {
        if (!tokenId) return
        if (!window.ethereum) {
            setError('请安装metamask')
            setLoading(false)
            return
        }
        loadNFT()
    }, [tokenId])

    // 7. 派生一个布尔值：当前用户是否是 owner 或 seller
    const isOwnerOrSeller =
        nft &&
        [
            nft.owner?.toLowerCase(),
            nft.seller?.toLowerCase(),
        ].includes(currentAddress?.toLowerCase());

    // 8. 最后写 UI
    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="flex ml-20 mt-20 gap-10">
                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : nft ? (
                    <>
                        <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-2/5 rounded-lg object-cover"
                        />

                        <section className="text-xl text-white shadow-2xl rounded-lg border-2 p-5 space-y-6">
                            <div>Name: {nft.name}</div>
                            <div>Description: {nft.description}</div>
                            <div>Price: {nft.price} ETH</div>
                            <div>Owner: {nft.owner}</div>
                            <div>Seller: {nft.seller}</div>

                            {!isOwnerOrSeller ? (
                                <button
                                    onClick={handleBuyNFT}
                                    disabled={buying}
                                    className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
                                >
                                    {buying ? "Buying..." : "Buy this NFT"}
                                </button>
                            ) : (
                                <div className="text-emerald-400">
                                    You are the owner or seller of this NFT
                                </div>
                            )}
                        </section>
                    </>
                ) : null}
            </main>
        </div>
    );
}


export default NFTPage