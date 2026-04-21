'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient, usePublicClient } from 'wagmi'

import { useAppDispatch, useAppSelector } from '@src/redux/hooks'
import { setWalletAddress, setLoading } from '@src/redux/modules/contract'
import { setChain, setisWalletInstalled, showWallet as toggleWallet } from '@src/redux/modules/wallet'
import { VALID_CHAINS, tokenAbi, stakingPoolAddresses } from '@src/config'
import abiJSON from '@src/util/abis.json'
import { createViemContract } from '@src/lib/viem'

export function listenToWallet() {
  const dispatch = useAppDispatch()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const chain = useMemo(
    () => VALID_CHAINS.find((item) => item.chainId === chainId) || null,
    [chainId],
  )

  useEffect(() => {
    dispatch(setWalletAddress(address ?? null))
  }, [address, dispatch])

  useEffect(() => {
    dispatch(setChain(chain))
  }, [chain, dispatch])

  useEffect(() => {
    dispatch(setisWalletInstalled(typeof window !== 'undefined' ? !!window.ethereum : true))
  }, [dispatch, isConnected])

  return null
}

export const useWallet = () => {
  const dispatch = useAppDispatch()
  const walletShowed = useAppSelector((state) => state.wallet.show)
  const loading = useAppSelector((state) => state.contract.loading)
  const walletAddress = useAppSelector((state) => state.contract.walletAddress)
  const chain = useAppSelector((state) => state.wallet.chain)
  const isWalletInstalled = useAppSelector((state) => state.wallet.isWalletInstalled)

  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId: chain?.chainId })

  const [saleAddress, setSaleAddress] = useState('')

  const saleContract = useMemo(() => {
    if (!saleAddress || !publicClient) {
      return null
    }

    return createViemContract({
      address: saleAddress,
      abi: abiJSON.hardhat.C2NSale,
      publicClient,
      walletClient,
    })
  }, [publicClient, saleAddress, walletClient])

  const depositTokenContract = useMemo(() => {
    const address =
      chain?.chainId &&
      stakingPoolAddresses.find((item) => item.chainId === chain.chainId)?.depositTokenAddress

    if (!address || !publicClient) {
      return null
    }

    return createViemContract({
      address,
      abi: tokenAbi,
      publicClient,
      walletClient,
    })
  }, [chain, publicClient, walletClient])

  function setWalletLoading(value) {
    dispatch(setLoading(value))
  }

  function showWallet(value) {
    dispatch(toggleWallet(value))
  }

  async function addToken(tokenAddress, symbolName) {
    if (!window.ethereum) {
      return
    }

    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: symbolName,
          decimals: 18,
        },
      },
    })
  }

  async function switchNetwork(targetChainId = VALID_CHAINS[0]?.chainId) {
    if (!targetChainId) {
      return
    }

    await switchChainAsync({ chainId: targetChainId })
  }

  async function disconnect() {
    await disconnectAsync()
    window.localStorage.removeItem('bobabrewery_auto_connect')
    dispatch(setWalletAddress(null))
    dispatch(setChain(null))
  }

  async function getAccount() {
    return walletAddress
  }

  return {
    walletAddress,
    walletShowed,
    loading,
    chain,
    validChains: VALID_CHAINS,
    isWalletInstalled,
    saleAddress,
    saleContract,
    depositTokenContract,
    breContract: null,

    setSaleAddress,
    setLoading: setWalletLoading,
    showWallet,
    addToken,
    switchNetwork,
    disconnect,
    getAccount,

    isConnected: !!walletAddress,
  }
}
