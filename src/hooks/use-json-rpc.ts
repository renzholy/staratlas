import useSWR, { SWRConfiguration } from 'swr'
import type { Static } from '@sinclair/typebox'
import { useMemo } from 'react'

import { useNetwork } from '../contexts/network'
import { API, call } from '../utils/json-rpc'

export default function useJsonRpc<T extends keyof typeof API>(
  method?: T,
  params?: Static<typeof API[T]['params']>,
  config?: SWRConfiguration,
) {
  const network = useNetwork()
  const key = useMemo(
    () => (method && params ? [network, method, JSON.stringify(params)] : null),
    [method, network, params],
  )
  return useSWR<Static<typeof API[T]['result']>>(key, () => call(network, method!, params!), config)
}
