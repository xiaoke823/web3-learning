import { useEffect, useRef, useState } from "react";

import { formatUnits, parseUnits } from "@src/lib/viem";
import { useWallet } from "./useWallet";
import { useSwap } from "./useSwap";
import { useMessage } from "./useMessage";

export const usePair = (pair: string) => {
  const [LPbalance, setLPBalance] = useState<bigint | null>(null);
  const [token1Addr, setToken1Addr] = useState("");
  const [token2Addr, setToken2Addr] = useState("");
  const [token1Symbol, setToken1Symbol] = useState("");
  const [token2Symbol, setToken2Symbol] = useState("");
  const [token1Balance, setToken1Balance] = useState<bigint | null>(null);
  const [token2Balance, setToken2Balance] = useState<bigint | null>(null);
  const [userToken1Reserve, setUserToken1Reserve] = useState<bigint | null>(null);
  const [userToken2Reserve, setUserToken2Reserve] = useState<bigint | null>(null);
  const updateStatusInternalTimer = useRef(null);
  const { getPairContract, getTokenContract, routerContract } = useSwap();
  const { setErrorMessage } = useMessage();
  const { walletAddress } = useWallet();

  useEffect(() => {
    if (!pair) return;
    updateStatus();
    updateStatusInternalTimer.current = setInterval(updateStatus, 2000);
    return () => clearInterval(updateStatusInternalTimer.current);
  }, [pair, walletAddress]);

  const updateStatus = () => {
    updateBalance();
    updateLPBalance(pair);
    updateReserves(pair);
  };

  async function updateTokenAddr() {
    if (!pair) return;
    const pairContract = getPairContract(pair);
    if (!pairContract) return;
    setToken1Addr(await pairContract.token0());
    setToken2Addr(await pairContract.token1());
  }

  useEffect(() => {
    if (!pair) return;
    updateLPBalance(pair);
    updateTokenAddr();
  }, [pair, walletAddress]);

  const updateReserves = async (pairAddress) => {
    const pairContract = getPairContract(pairAddress);
    if (!pairContract || !walletAddress) return;
    const reserves = await pairContract.getReserves();
    const reserve0 = reserves[0] as bigint;
    const reserve1 = reserves[1] as bigint;
    const liquidity = (await pairContract.balanceOf(walletAddress)) as bigint;
    const totalSupply = (await pairContract.totalSupply()) as bigint;
    if (!totalSupply) return;
    setUserToken1Reserve((reserve0 * liquidity) / totalSupply);
    setUserToken2Reserve((reserve1 * liquidity) / totalSupply);
  };

  const updateBalance = async () => {
    const token1Contract = getTokenContract(token1Addr);
    const token2Contract = getTokenContract(token2Addr);
    if (token1Contract && token2Contract && walletAddress) {
      setToken1Balance(await token1Contract.balanceOf(walletAddress));
      setToken2Balance(await token2Contract.balanceOf(walletAddress));
    }
  };

  const updateLPBalance = async (pairAddress) => {
    const pairContract = getPairContract(pairAddress);
    if (pairContract && walletAddress) {
      setLPBalance(await pairContract.balanceOf(walletAddress));
    }
  };

  useEffect(() => {
    if (!pair || !walletAddress) return;
    updateReserves(pair);
  }, [pair, walletAddress]);

  useEffect(() => {
    const token1Contract = getTokenContract(token1Addr);
    const token2Contract = getTokenContract(token2Addr);
    const updateSymbols = async () => {
      if (token1Contract && token2Contract) {
        setToken1Symbol(await token1Contract.symbol());
        setToken2Symbol(await token2Contract.symbol());
      }
    };
    updateSymbols();
    updateBalance();
  }, [token1Addr, token2Addr, LPbalance, walletAddress, routerContract]);

  const name = `${token1Symbol}/${token2Symbol}`;

  const quote = async (pairAddress, amountA) => {
    const pairContract = getPairContract(pairAddress);
    if (!pairContract) return 0;
    const reserves = await pairContract.getReserves();
    const reserve0 = reserves[0] as bigint;
    const reserve1 = reserves[1] as bigint;
    if (reserve0 === 0n || reserve1 === 0n) {
      setErrorMessage("Insufficient liquidity");
      return 0;
    }

    const amountIn = parseUnits(String(amountA), 18);
    const amountOut = (reserve1 * amountIn) / reserve0;
    return Number(formatUnits(amountOut, 18));
  };

  const approveToRouter = async (tokenAddr, amount) => {
    const tokenContract = getTokenContract(tokenAddr);
    return tokenContract.approve(routerContract.address, amount);
  };

  return {
    LPbalance,
    token1Addr,
    token2Addr,
    token1Symbol,
    token2Symbol,
    token1Balance,
    token2Balance,
    userToken1Reserve,
    userToken2Reserve,
    name,
    quote,
    approveToRouter,
  };
};
