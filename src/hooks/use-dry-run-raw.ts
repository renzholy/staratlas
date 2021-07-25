import { useCallback } from 'react'

import { useProvider } from './use-provider'

export default function useDryRunRaw(sender_public_key?: string, payload?: string) {
  const provider = useProvider()
  return useCallback(async () => {
    if (!sender_public_key || !payload) {
      return undefined
    }
    const transactionHash = await provider.dryRunRaw(payload, sender_public_key)
    return transactionHash
  }, [sender_public_key, payload, provider])
}
