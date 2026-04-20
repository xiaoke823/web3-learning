
import {ethers} from 'ethers'
import axios from 'axios'
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import { GetIpfsUrlFromPinata } from "../utils";
import { useState,useEffect } from "react";

export default function MarketPlace(){
    const [nfts,setNfts] = useState([])
    const [loading,setLoading] = useState(false)
    const [error,setError]= useState('')

    const fetchAllNFTs = async ()=>{
        setLoading(true)
        try{
            // 1. 检查钱包环境
            if(!window.ethereum){
                throw new Error('请安装小狐狸钱包')
            }
            // 2. 创建 provider
            const provider = new ethers.BrowserProvider(window.ethereum)
            // 3. 创建 contract
            const contract = new ethers.Contract(MarketplaceJSON.address,MarketplaceJSON.abi,provider)
            // 4. 调用 getAllNFTs()
            let nftList = await contract.getAllNFTs();
            // 5. Promise.all 处理 metadata
            const items = await Promise.all(
                nftList.map(async(nft)=>{
                    const tokenURI = GetIpfsUrlFromPinata(
                        await contract.tokenURI(nft.tokenId)
                    )

                    const {data:meta} = await axios.get(tokenURI)
                    const item = {
                        owner:nft.owner,
                        seller:nft.seller,
                        tokenId:Number(nft.tokenId),
                        // price: ethers.formatEther(nft.price),
                        price: ethers.formatUnits(nft.price,8),
                        image: GetIpfsUrlFromPinata(meta.image),
                        name: meta.name,
                        description:meta.description
                    }
                    return item
                })
            )
            // 6. setNfts(items)
            setNfts(items)
        }catch(err){
            console.log('error',err)
            setError(err.message)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchAllNFTs();
    },[])

    return (
        <div>
            <Navbar/>
            <div>
                <h1>Top Nfts</h1>
                {loading && <p>Loading</p>}
                {error && <p>{error}</p>}

                {!loading && !error && <div>
                    {nfts.length>0?(nfts.map((nft)=>{
                        return <NFTTile key={nft.tokenId} data={nft}></NFTTile>
                    }))
                    :<p>No NFTs Found</p>}
                </div>}
            </div>
        </div>
    )

}