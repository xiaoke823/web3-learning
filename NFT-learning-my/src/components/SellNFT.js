import { useState } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";

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

    const handleInputChange = ()=>{

    }

    const handleFileUpload = ()=>{
         
    }

    return (
        <div>

        </div>
    )
}

export default SellNFT