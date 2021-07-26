import { types } from '@starcoin/starcoin'
import useSWR from 'swr'

import { useProvider } from './use-provider'

export function useResolveFunction(functionId?: string) {
  const provider = useProvider()
  return useSWR<{ args: { name: string; type_tag: types.TypeTag; doc: string }[] }>(
    functionId ? [provider.connection.url, 'resolve_function', functionId] : null,
    () => provider.send('contract.resolve_function', [functionId]),
  )
}
