import useSWR, { SWRConfiguration } from 'swr'
import type { Static } from '@sinclair/typebox'
import useNetwork from 'hooks/use-network'
import { API, jsonRpc } from 'utils/json-rpc'

export default function useJsonRpc<T extends keyof typeof API>(
  method?: T,
  params?: Static<typeof API[T]['params']>,
  config?: SWRConfiguration,
) {
  const network = useNetwork()
  return useSWR<Static<typeof API[T]['result']>>(
    method && params
      ? [network, 'jsonRpc', method, ...params.map((param) => JSON.stringify(param))]
      : null,
    () => jsonRpc(network, method!, ...params!),
    config,
  )
}
