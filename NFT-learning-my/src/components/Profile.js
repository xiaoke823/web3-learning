import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import { GetIpfsUrlFromPinata } from "../utils";


function Profile() {
    const [nfts, setNfts] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [totalValue, setTotalValue] = useState("0.000");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMyNFT = async ()=>{
        setLoading(true)
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const address = await signer.getAddress()
            const contract = new ethers.Contract(
                MarketplaceJSON.address,
                MarketplaceJSON.abi,
                signer
            )
            const myNFTs = await contract.getMyNFTs()
            // await tx.wait()
            let nftlist = await Promise.all(myNFTs.map(async (item)=>{
                const tokenURI = await contract.tokenURI(item.tokenId)
                const url = GetIpfsUrlFromPinata(tokenURI)
                const res = await fetch(url)
                const metadata =  await res.json()
                const price = ethers.formatEther(item.price)
                const nft = {
                    price,
                    tokenId:Number(item.tokenId),
                    owner:item.owner,
                    seller:item.seller,
                    name:metadata.name,
                    description:metadata.description,
                    image:GetIpfsUrlFromPinata(metadata.image)
                }
                return nft
            }))
            setNfts(nftlist)
            const total = nftlist.reduce((sum,nft)=>{
                return sum + Number(nft.price)
            },0)
            setTotalValue(total.toFixed(3))
            setWalletAddress(address)
        } catch (error) {
            setError(error.message)
        } finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(!window.ethereum) return 
        loadMyNFT()
    },[])
    return (
        <div>
            profile
        </div>
    )
}

export default Profile