import useSWR from 'swr'
import type { Static } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv/dist/2019'
import { useMemo } from 'react'

import { useNetwork } from '../contexts/network'
import { API } from '../utils/json-rpc/chain'

const ajv = addFormats(new Ajv()).addKeyword('kind').addKeyword('modifier')

export function useJsonRpc<T extends keyof typeof API>(
  method: T,
  ...params: Static<typeof API[T]['params']>
) {
  const network = useNetwork()
  const key = useMemo(() => [network, method, JSON.stringify(params)], [method, network, params])
  return useSWR<Static<typeof API[T]['result']>>(key, () =>
    fetch(`https://${network}-seed.starcoin.org`, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 0 }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if ('result' in json) {
          if (ajv.validate(API[method].result, json.result)) {
            return json.result
          }
          throw new Error(ajv.errorsText(ajv.errors))
        }
        if ('error' in json && 'message' in json.error) {
          throw new Error(json.error.message)
        }
        throw new Error('unknown json rpc error')
      }),
  )
}
