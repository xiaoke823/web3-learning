'use client'

import '@src/styles/global.scss'

import { useEffect } from 'react'

import { Layout } from 'antd'

import { Providers } from '@src/Providers'
import AppFooter from '@src/containers/Footer/Footer'
import AppHeader from '@src/containers/Header/Header'
import WalletModal from '@src/containers/WalletModal/WalletModal'
import { listenToWallet } from '@src/hooks/useWallet'
import { useResponsiveInit } from '@src/hooks/useResponsive'

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { Content } = Layout

  listenToWallet()
  useResponsiveInit()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const referral = params.get('aff')
    if (referral) {
      window.localStorage.setItem('referral', referral)
    }
  }, [])

  return (
    <Providers>
      <WalletModal />
      <div className="main-wrapper">
        <AppHeader />
        <div className="main-body">
          <Content>
            {children}
            <AppFooter />
          </Content>
        </div>
      </div>
    </Providers>
  )
}
