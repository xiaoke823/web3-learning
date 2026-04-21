'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '@src/config/wagmi'
import localStore from '@src/redux/store'

const queryClient = new QueryClient()

export const Providers = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Provider store={localStore}>{children}</Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers
