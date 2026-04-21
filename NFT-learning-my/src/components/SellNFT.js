import { useState } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import MarketplaceJSON from "../Marketplace.json";

const initFormState = {
    name:'',
    description:'',
    price:''
}
function SellNFT(){
    const [formData,setFormData] = useState(initFormState)
    const [fileUrl,setFileURL] = useState('')
    const [message,setMessage] = useState('');
    const [isUploading,setIsUploading] = useState(false)
    const [isListing,setIsListing] = useState(false)

    const isDisabled = isUploading || isListing

    const handleInputChange = (e)=>{
        const {name,value} = e.target
        setFormData((prev)=>{
            return {
                ...prev,
                [name]:value
            }
        })
    }

    const handleFileUpload = async (e)=>{
        const file = e.target.files?.[0]
        if(!file) return 
        try {
            setIsUploading(true)
            setMessage('uploading')

            const res = await uploadFileToIPFS(file)
            if(!res?.success) {
                throw new Error("Image upload failed");
            }
            setFileURL(res.pinataURL)
            setMessage('')
        } catch (error) {
            setMessage(error.message)
            return null
        } finally{
            setIsUploading(false)
        }
    }

    const handleMetadataUpload = async ()=>{
        const {name,description,price} = formData
        if (!name || !description || !price || !fileUrl) {
            setMessage("Please fill in all fields and upload an image.");
            return null;
        }

        const metadata = {
            name,
            description,
            price,
            image:fileUrl
        }
        try {
            const res = await uploadJSONToIPFS(metadata)
            if(!res?.success){
                throw new Error("Metadata upload failed");
            }
            return res.pinataURL
        } catch (error) {
            setMessage(error.message)
            return null
        }
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        if(!window.ethereum) {
            setMessage("MetaMask is not installed.");
            return 
        } 
        try {
            setIsListing(true)
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(MarketplaceJSON.address,MarketplaceJSON.abi,signer)
            const listPrice = await contract.getListPrice()
            const tokenURI = await handleMetadataUpload()
            if (!tokenURI) return;
            const price = ethers.parseEther(formData.price)
            const tx = await contract.createToken(tokenURI, price,{value:listPrice})
            await tx.wait()

            alert("Successfully listed your NFT!");

            setFormData(initFormState);
            setFileURL("");
            setMessage("");
        } catch (error) {
            setMessage(error.message)
            return null
        } finally{
            setIsListing(false)
        }
    }

    return (
        <div>
            <Navbar/>
            <div id="form">
                <form onSubmit={handleSubmit}>
                    <h3>Upload your NFT to the marketplace</h3>
                
                    <div>
                        <label htmlFor='name'>NFT Name</label>
                        <input
                            id="name"
                            name="name"
                            type='text'
                            placeholder="Axie#4563"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='description'>NFT Description</label>
                        <textarea
                            rows='5'
                            name='description'
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='price'>NFT Price</label>
                        <input
                            id="price"
                            name="price"
                            type='number'
                            step="0.00001"
                            placeholder="Min 0.00001 ETH"
                            value={formData.price}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label>upload file</label>
                        <input type='file' id="image" onChange={handleFileUpload} />
                    </div>

                    <br/>

                    <div>{message}</div>
                    <button 
                        type='submit'
                        disabled={isDisabled}
                        className=""
                    >
                        {isListing ? 'Listing' : isUploading? 'Uploading': 'List NFT'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SellNFT