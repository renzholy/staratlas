import { providers } from '@starcoin/starcoin'
import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'

import { useNetwork } from '../contexts/network'
import { jsonFetcher } from '../utils/fetcher'

export function useProvider() {
  const network = useNetwork()
  return useMemo(
    () => new providers.JsonRpcProvider(`https://${network}-seed.starcoin.org`),
    [network],
  )
}

export function useResource(address: string, resource: string, config?: SWRConfiguration) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR(
    [network, 'getResource', address, resource],
    async () => provider.getResource(address, resource),
    config,
  )
}

export function useResources(address?: string) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR(address ? [network, 'getResources', address] : null, () =>
    provider.getResources(address!),
  )
}

export function useBalances(address: string) {
  const provider = useProvider()
  const network = useNetwork()
  return useSWR([network, 'getBalances', address], () => provider.getBalances(address))
}

export function useResolveFunction(functionId?: string) {
  const network = useNetwork()
  return useSWR(functionId ? [network, 'resolve_function', functionId] : null, () =>
    jsonFetcher(`https://${network}-seed.starcoin.org`, {
      method: 'POST',
      body: JSON.stringify({
        id: 42,
        jsonrpc: '2.0',
        method: 'contract.resolve_function',
        params: [functionId],
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }),
  )
}
