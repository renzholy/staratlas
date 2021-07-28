import { Network } from './types'

enum SupportedChainId {
  MAINNET = 1,
  PROXIMA = 2,
  BARNARD = 251,
  HALLEY = 253,
}

export const NETWORKS: {
  [chain in SupportedChainId]: Network
} = {
  [SupportedChainId.MAINNET]: 'main',
  [SupportedChainId.BARNARD]: 'barnard',
  [SupportedChainId.HALLEY]: 'halley',
  [SupportedChainId.PROXIMA]: 'proxima',
}

export const INDEX_SIZE: { [key in Network]: number } = {
  main: 10,
  barnard: 10,
  halley: 5,
  proxima: 5,
}
