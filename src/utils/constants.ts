enum SupportedChainId {
  MAINNET = 1,
  PROXIMA = 2,
  BARNARD = 251,
  HALLEY = 253,
}

export const NETWORKS: {
  [chain in SupportedChainId]: string
} = {
  [SupportedChainId.MAINNET]: 'main',
  [SupportedChainId.BARNARD]: 'barnard',
  [SupportedChainId.HALLEY]: 'halley',
  [SupportedChainId.PROXIMA]: 'proxima',
}

export const ENDPOINT = 'https://api.stcscan.io/v1'
