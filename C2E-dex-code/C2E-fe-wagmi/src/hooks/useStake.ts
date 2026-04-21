import { useEffect, useMemo, useState } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'

import abiJSON from '@src/util/abis.json'
import { parseEther, parseUnits, createViemContract } from '@src/lib/viem'
import {
  STAKING_POOL_ID,
  APPROVE_STAKING_AMOUNT_ETHER,
  tokenAbi,
  stakingPoolAddresses,
} from '@src/config'
import { useWallet } from './useWallet'

export const useStake = () => {
  const { chain, walletAddress } = useWallet()
  const publicClient = usePublicClient({ chainId: chain?.chainId })
  const { data: walletClient } = useWalletClient()

  const [earnedBre, setEarnedBre] = useState<bigint | null>(null)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [depositSymbol, setDepositSymbol] = useState<string>()
  const [depositDecimals, setDepositDecimals] = useState(18)
  const [earnedSymbol, setEarnedSymbol] = useState<string>()
  const [depositedAmount, setDepositedAmount] = useState<bigint | null>(null)
  const [allowance, setAllowance] = useState<bigint>()
  const [totalPending, setTotalPending] = useState<bigint>()
  const [depositTokenAddress, setDepositTokenAddress] = useState<string>('')
  const [earnedTokenAddress, setEarnedTokenAddress] = useState<string>('')
  const [stakingAddress, setStakingAddress] = useState<string>('')
  const [allowanceAddress, setAllowanceAddress] = useState<string>('')
  const [poolId, setPoolId] = useState<number>(STAKING_POOL_ID)

  const stakingContract = useMemo(() => {
    if (!stakingAddress || !publicClient) return null
    return createViemContract({
      address: stakingAddress,
      abi: abiJSON.hardhat.AllocationStaking,
      publicClient,
      walletClient,
    })
  }, [publicClient, stakingAddress, walletClient])

  const viewStakingContract = useMemo(() => {
    if (!stakingAddress || !publicClient) return null
    return createViemContract({
      address: stakingAddress,
      abi: abiJSON.hardhat.AllocationStaking,
      publicClient,
    })
  }, [publicClient, stakingAddress])

  const depositTokenContract = useMemo(() => {
    if (!depositTokenAddress || !publicClient) return null
    return createViemContract({
      address: depositTokenAddress,
      abi: tokenAbi,
      publicClient,
      walletClient,
    })
  }, [depositTokenAddress, publicClient, walletClient])

  const earnedTokenContract = useMemo(() => {
    if (!earnedTokenAddress || !publicClient) return null
    return createViemContract({
      address: earnedTokenAddress,
      abi: tokenAbi,
      publicClient,
      walletClient,
    })
  }, [earnedTokenAddress, publicClient, walletClient])

  useEffect(() => {
    if (depositTokenContract && allowanceAddress && walletAddress) {
      getAllowance(walletAddress, allowanceAddress)
    }
  }, [depositTokenContract, allowanceAddress, walletAddress])

  useEffect(() => {
    if (stakingContract && walletAddress) {
      getDeposited(poolId, walletAddress)
    }
  }, [poolId, stakingContract, walletAddress])

  useEffect(() => {
    if (depositTokenContract && walletAddress) {
      depositTokenContract.balanceOf(walletAddress).then(setBalance).catch(console.error)
      depositTokenContract.decimals().then(setDepositDecimals).catch(console.error)
      depositTokenContract.symbol().then(setDepositSymbol).catch(console.error)
    }
  }, [depositTokenContract, walletAddress])

  async function getBalance(account) {
    if (depositTokenContract && account) {
      depositTokenContract.balanceOf(account).then(setBalance).catch(console.error)
      depositTokenContract.decimals().then(setDepositDecimals).catch(console.error)
      depositTokenContract.symbol().then(setDepositSymbol).catch(console.error)
    }

    if (earnedTokenContract && account) {
      earnedTokenContract.symbol().then(setEarnedSymbol).catch(console.error)
    }

    if (stakingContract && account) {
      stakingContract.pending(poolId, account).then(setEarnedBre).catch(console.error)
      stakingContract.totalPending().then(setTotalPending).catch(console.error)
    }
  }

  async function getDeposited(pid, address) {
    if (!stakingContract || !address) return
    const value = await stakingContract.deposited(pid, address)
    setDepositedAmount(value)
  }

  async function approve(contractAddress, amount, decimals = 18) {
    if (!depositTokenContract) {
      return Promise.reject()
    }

    const approveAmount =
      amount > APPROVE_STAKING_AMOUNT_ETHER ? String(amount) : String(APPROVE_STAKING_AMOUNT_ETHER)

    const tx = await depositTokenContract.approve(contractAddress, parseUnits(approveAmount, decimals))
    await tx.wait()
    await getAllowance(walletAddress, allowanceAddress)
    return tx
  }

  function deposit(pid, amount) {
    if (!stakingContract) {
      return Promise.reject()
    }

    return stakingContract.deposit(pid, parseEther(amount))
  }

  function withdraw(pid, amount) {
    if (!stakingContract) {
      return Promise.reject()
    }

    return stakingContract.withdraw(pid, parseEther(amount))
  }

  async function getAllowance(owner, spender) {
    if (!depositTokenContract || !owner || !spender) {
      return Promise.reject()
    }

    const value = await depositTokenContract.allowance(owner, spender)
    setAllowance(value)
  }

  async function poolInfo(pid) {
    if (!stakingContract) {
      return Promise.reject()
    }

    return stakingContract.poolInfo(pid)
  }

  async function updateBalanceInfo() {
    return Promise.all([
      getBalance(walletAddress),
      getDeposited(poolId, walletAddress),
      getAllowance(walletAddress, allowanceAddress),
    ])
  }

  const globalPoolStakingAddress = useMemo(() => {
    if (!chain) return ''
    return stakingPoolAddresses.find((item) => item.chainId == chain.chainId)?.stakingAddress || ''
  }, [chain])

  const globalPoolDepositTokenAddress = useMemo(() => {
    if (!chain) return ''
    return stakingPoolAddresses.find((item) => item.chainId == chain.chainId)?.depositTokenAddress || ''
  }, [chain])

  const globalPoolEarnedTokenAddress = useMemo(() => {
    if (!chain) return ''
    return stakingPoolAddresses.find((item) => item.chainId == chain.chainId)?.earnedTokenAddress || ''
  }, [chain])

  return {
    depositedAmount,
    earnedBre,
    balance,
    depositSymbol,
    depositDecimals,
    earnedSymbol,
    totalPending,
    allowance,

    getBalance,
    approve,
    deposit,
    withdraw,
    poolInfo,
    updateBalanceInfo,

    stakingContract,
    viewStakingContract,
    depositTokenContract,

    setDepositTokenAddress,
    setEarnedTokenAddress,
    setStakingAddress,
    setAllowanceAddress,
    setPoolId,
    globalPoolStakingAddress,
    globalPoolDepositTokenAddress,
    globalPoolEarnedTokenAddress,
  }
}
