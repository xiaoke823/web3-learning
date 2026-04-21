'use client'

import { Provider } from 'react-redux'
import localStore from '@src/redux/store'

export const Providers = ({ children }) => {
  return (
    <Provider store={localStore}>
      {children}
    </Provider>
  )
}

export default Providers
