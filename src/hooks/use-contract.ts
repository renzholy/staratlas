import type { types } from '@starcoin/starcoin'
import useSWR from 'swr'

import { useProvider } from './use-provider'

export function useResolveFunction(functionId?: string) {
  const provider = useProvider()
  return useSWR<{ args: { name: string; type_tag: types.TypeTag; doc: string }[] }>(
    functionId ? [provider.connection.url, 'resolve_function', functionId] : null,
    () => provider.send('contract.resolve_function', [functionId]),
  )
}

export function useScalingFactor(token?: string) {
  const provider = useProvider()
  return useSWR<[number]>(token ? [provider.connection.url, 'scaling_factor', token] : null, () =>
    provider.send('contract.call_v2', [
      {
        function_id: '0x1::Token::scaling_factor',
        type_args: [token],
        args: [],
      },
    ]),
  )
}
