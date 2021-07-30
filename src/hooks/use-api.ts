import last from 'lodash/last'
import useSWR, { SWRConfiguration, SWRInfiniteConfiguration, useSWRInfinite } from 'swr'
import { Type } from 'utils/api'
import { jsonFetcher } from 'utils/fetcher'
import { jsonRpc } from 'utils/json-rpc'
import useNetwork from './use-network'

type Response<T extends Type> = T extends 'transaction'
  ? { _id: string; height: string; sender?: string }
  : { _id: string; height: string; author: string }

export function useTransactionsByHeight<T extends Type>(
  height?: BigInt,
  strict?: boolean,
  config?: SWRInfiniteConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<Response<T>[]>(
    (_, previousPageData) =>
      previousPageData?.length
        ? `/api/transactions-by-height?network=${network}&height=${
            BigInt(last(previousPageData)!.height) - BigInt(1)
          }&strict=${strict ? '1' : ''}`
        : height !== undefined
        ? `/api/transactions-by-height?network=${network}&height=${height}&strict=${
            strict ? '1' : ''
          }`
        : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionsByAddress<T extends Type>(
  address?: string,
  config?: SWRConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<Response<T>[]>(
    (_, previousPageData) => {
      if (!address) {
        return null
      }
      if (previousPageData && !previousPageData.length) {
        return null
      }
      if (previousPageData) {
        return `/api/transactions-by-address?network=${network}&address=${address}&height=${
          BigInt(last(previousPageData)!.height) - BigInt(1)
        }`
      }
      return `/api/transactions-by-address?network=${network}&address=${address}`
    },
    jsonFetcher,
    config,
  )
}

export function useLatest<T extends Type>(type: T, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<Response<T>[]>(
    [network, type, 'latest'],
    async () => {
      const info = await jsonRpc(network, 'chain.info', [])
      return jsonFetcher(
        `/api/list/height?network=${network}&height=${info.head.number}&type=${type}`,
      )
    },
    config,
  )
}
