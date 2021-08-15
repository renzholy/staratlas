import type { Network } from './types'

export enum ChainId {
  MAINNET = 1,
  BARNARD = 251,
  PROXIMA = 2,
  HALLEY = 253,
}

export const NETWORKS: {
  [chain in ChainId]: Network
} = {
  [ChainId.MAINNET]: 'main',
  [ChainId.BARNARD]: 'barnard',
  [ChainId.HALLEY]: 'halley',
  [ChainId.PROXIMA]: 'proxima',
}

export const API_PAGE_SIZE = 10

export const RPC_BLOCK_LIMIT = 32
