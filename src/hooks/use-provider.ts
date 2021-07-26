import { providers, types } from '@starcoin/starcoin'
import { useMemo } from 'react'
import useSWR, { SWRConfiguration } from 'swr'

import { useNetwork } from '../contexts/network'

export function useProvider() {
  const network = useNetwork()
  return useMemo(
    () => new providers.JsonRpcProvider(`https://${network}-seed.starcoin.org`),
    [network],
  )
}

export function useResource(address: string, resource: string, config?: SWRConfiguration) {
  const provider = useProvider()
  return useSWR(
    [provider.connection.url, 'getResource', address, resource],
    async () => provider.getResource(address, resource),
    config,
  )
}

export function useResources(address?: string) {
  const provider = useProvider()
  return useSWR(address ? [provider.connection.url, 'getResources', address] : null, () =>
    provider.getResources(address!),
  )
}

export function useBalances(address: string) {
  const provider = useProvider()
  return useSWR([provider.connection.url, 'getBalances', address], () =>
    provider.getBalances(address),
  )
}

export function useResolveFunction(functionId?: string) {
  const provider = useProvider()
  return useSWR<{ args: { name: string; type_tag: types.TypeTag; doc: string }[] }>(
    functionId ? [provider.connection.url, 'resolve_function', functionId] : null,
    () => provider.send('contract.resolve_function', [functionId]),
  )
}
