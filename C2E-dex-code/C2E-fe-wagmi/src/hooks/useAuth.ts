'use client'

import { useEffect, useMemo } from 'react'
import { useConnect, useDisconnect } from 'wagmi'

import { ConnectorNames, connectorLocalStorageKey } from '@src/types/Connector'
import { useMessage } from './useMessage'
import { useWallet } from './useWallet'

export const useAuth = () => {
  const { connectors, connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { walletAddress } = useWallet()
  const { setErrorMessage } = useMessage()

  const connectorMap = useMemo(
    () => ({
      [ConnectorNames.Injected]:
        connectors.find((item) => item.id === 'metaMask') ||
        connectors.find((item) => item.id === 'injected'),
      [ConnectorNames.WalletConnect]: connectors.find((item) => item.id === 'walletConnect'),
      [ConnectorNames.BSC]:
        connectors.find((item) => item.id === 'metaMask') ||
        connectors.find((item) => item.id === 'injected'),
      [ConnectorNames.Blocto]:
        connectors.find((item) => item.id === 'injected') ||
        connectors.find((item) => item.id === 'metaMask'),
    }),
    [connectors],
  )

  async function login(connectorID: string) {
    const connector = connectorMap[connectorID]
    if (!connector) {
      setErrorMessage('No available connector for this wallet.')
      return
    }

    await connectAsync({ connector })
    window.localStorage.setItem('bobabrewery_auto_connect', '1')
  }

  async function logout() {
    await disconnectAsync()
  }

  useEffect(() => {
    const autoConnect = window.localStorage.getItem('bobabrewery_auto_connect')
    const connectorId = window.localStorage.getItem(connectorLocalStorageKey)
    if (autoConnect && connectorId && !walletAddress) {
      login(connectorId).catch(() => undefined)
      window.localStorage.removeItem('bobabrewery_auto_connect')
    }
  }, [walletAddress])

  return {
    account: walletAddress,
    active: !!walletAddress,
    login,
    logout,
    supportedConnectorIds: Object.entries(connectorMap)
      .filter(([, connector]) => !!connector)
      .map(([id]) => id),
  }
}

export default useAuth
