'use client'
import { useEffect, useState } from "react";
import { Contract, formatUnits, ethers,BrowserProvider } from "ethers";
import { constants } from "buffer";
export default function ContractPage() {
    
    const [sym, setSym] = useState<string>('');
    const [decimals, setDecimals] = useState<number>(0);
    const [balance, setBalance] = useState<string>('0');
    const [formattedBalance, setFormattedBalance] = useState<string>('0');
    // const [provider, setProvider] = useState<BrowserProvider>();
    const [contract, setContract] = useState<Contract>();

    useEffect(()=>{
        const provider = new BrowserProvider((window as any).ethereum)
        // The contract ABI (fragments we care about)
        const abi = [
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function balanceOf(address a) view returns (uint)"
        ]
        
        // Create a contract; connected to a Provider, so it may
        // only access read-only methods (like view and pure)
        const contract = new Contract("dai.tokens.ethers.eth", abi, provider)
        setContract(contract);
    },[])
    
    // The symbol name for the token
    async function fetchSymbol() {
        const symbol = await contract?.symbol()
        setSym(symbol);
    }

    // The number of decimals the token uses
    async function fetchDecimals() {
        const decimals = await contract?.decimals()
        setDecimals(decimals);
    }

    // Read the token balance for an account
    async function fetchBalance() {
        const balance = await contract?.balanceOf("ethers.eth")
        setBalance(balance.toString());
        return balance;
    }

    // Format the balance for humans, such as in a UI
    async function formatBalance() {
        const balance = await fetchBalance();
        const formatted = formatUnits(balance, decimals)
        setFormattedBalance(formatted)
    }

    // '4000.0'
    return (
        <div>
            <h1>ContractPage</h1>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={fetchSymbol}>getSymbol</button>
            <div>symbol: {sym}</div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={fetchDecimals}>getDecimals</button>
            <div>decimals: {decimals}</div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={fetchBalance}>getBalance</button>
            <div>balance: {balance}</div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={formatBalance}>getFormattedBalance</button>
            <div>formatted balance: {formattedBalance}</div>
        </div>
    )
}
