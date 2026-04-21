import { http, createConfig } from 'wagmi'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { defineChain, type Chain } from 'viem'

import { VALID_CHAINS } from './valid_chains'

const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

export const wagmiChains = VALID_CHAINS.map((chain) =>
  defineChain({
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: {
        http: chain.rpc,
      },
      public: {
        http: chain.rpc,
      },
    },
    blockExplorers: {
      default: {
        name: chain.name,
        url: chain.infoURL,
      },
    },
    testnet: chain.chainId !== 1,
  }),
) as [Chain, ...Chain[]]

const connectors = [metaMask(), injected()]

if (reownProjectId) {
  connectors.push(
    walletConnect({
      projectId: reownProjectId,
      showQrModal: true,
    }),
  )
}

export const wagmiConfig = createConfig({
  chains: wagmiChains,
  connectors,
  transports: Object.fromEntries(
    wagmiChains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])]),
  ),
  multiInjectedProviderDiscovery: true,
})

export const supportedChainIds = wagmiChains.map((chain) => chain.id)
