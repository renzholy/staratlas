import { createContext, useContext } from 'react'
import { NETWORKS } from '../constants'

const Network = createContext<string>(NETWORKS[1])

export const NetworkProvider = Network.Provider

export function useNetwork() {
  return useContext(Network)
}
