import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'

import { tokenAbi, pairAbi } from '@src/config'
import { formatUnits, parseUnits, createViemContract } from '@src/lib/viem'
import { useMessage } from './useMessage'
import { useFactoryContract, useRouterContract } from './useContract'
import { useWallet } from './useWallet'

export const useSwap = ({ noPairAlert } = { noPairAlert: true }) => {
  const { chain } = useWallet()
  const publicClient = usePublicClient({ chainId: chain?.chainId })
  const { data: walletClient } = useWalletClient()
  const [token1Address, setToken1Address] = useState<string>('')
  const [token2Address, setToken2Address] = useState<string>('')
  const [pairsAddress, setPairsAddress] = useState<string[]>([])
  const [pairsContract, setPairsContract] = useState<any[]>([])
  const [pair, setPair] = useState<string | null>(null)
  const { setErrorMessage } = useMessage()

  const routerContract = useRouterContract()
  const factoryContract = useFactoryContract()

  async function getAmountsOut({ token1Address, token2Address, tokenInAmount }): Promise<any> {
    const quoteAmount = parseUnits(String(tokenInAmount), 18)
    const quoteResult = await routerContract.getAmountsOut(quoteAmount, [token1Address, token2Address])
    return {
      token1Amount: formatUnits(quoteResult[0], 18),
      token2Amount: formatUnits(quoteResult[1], 18),
    }
  }

  useEffect(() => {
    if (!factoryContract || !token1Address || !token2Address) return
    factoryContract.getPair(token1Address, token2Address).then((data) => {
      if (data && data !== '0x0000000000000000000000000000000000000000') {
        setPair(data)
      } else {
        setPair(null)
        if (noPairAlert) {
          setErrorMessage('No available pair found.')
        }
      }
    })
  }, [token1Address, token2Address, factoryContract, chain])

  async function getAllPairs() {
    if (!factoryContract) return
    const length = Number(await factoryContract.allPairsLength())
    const pairs = []
    for (let i = 0; i < length; i += 1) {
      pairs.push(await factoryContract.allPairs(i))
    }
    setPairsAddress(pairs)
  }

  useEffect(() => {
    getAllPairs()
  }, [factoryContract])

  useEffect(() => {
    if (!publicClient || !pairsAddress.length) return
    setPairsContract(
      pairsAddress.map((address) =>
        createViemContract({
          address,
          abi: pairAbi,
          publicClient,
          walletClient,
        }),
      ),
    )
  }, [pairsAddress, publicClient, walletClient])

  const getPairContract = useCallback(
    (pairAddress: string) => {
      if (!pairAddress || !publicClient) return null
      return createViemContract({
        address: pairAddress,
        abi: pairAbi,
        publicClient,
        walletClient,
      })
    },
    [publicClient, walletClient],
  )

  const getTokenContract = useCallback(
    (tokenAddress: string) => {
      if (!tokenAddress || !publicClient) return null
      return createViemContract({
        address: tokenAddress,
        abi: tokenAbi,
        publicClient,
        walletClient,
      })
    },
    [publicClient, walletClient],
  )

  const approveToRouter = async (tokenAddr, amount) => {
    const tokenContract = getTokenContract(tokenAddr)
    return tokenContract.approve(routerContract.address, amount)
  }

  return {
    getAmountsOut,
    setToken1Address,
    setToken2Address,
    token1Address,
    token2Address,
    routerContract,
    pairsContract,
    pairsAddress,
    getPairContract,
    getTokenContract,
    pair,
    getAllPairs,
    approveToRouter,
  }
}
