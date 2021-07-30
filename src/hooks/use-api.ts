import last from 'lodash/last'
import useSWR, { SWRConfiguration, SWRInfiniteConfiguration, useSWRInfinite } from 'swr'
import { jsonFetcher } from 'utils/fetcher'
import { call } from 'utils/json-rpc'
import useNetwork from './use-network'

type Type = 'block' | 'transaction' | 'uncle'

type Response<T extends Type> = T extends 'transaction'
  ? { _id: string; height: string; sender?: string }
  : { _id: string; height: string; author: string }

export function useByHash<T extends Type>(type: T, hash?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<Response<T>>(
    hash ? `/api/list/hash?network=${network}&height=${hash}&type=${type}` : null,
    jsonFetcher,
    config,
  )
}

export function useListByHeight<T extends Type>(
  type: T,
  height?: BigInt,
  strict?: boolean,
  config?: SWRInfiniteConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<Response<T>[]>(
    (_, previousPageData) =>
      previousPageData?.length
        ? `/api/list/height?network=${network}&height=${
            BigInt(last(previousPageData)!.height) - BigInt(1)
          }&strict=${strict ? '1' : ''}&type=${type}`
        : height !== undefined
        ? `/api/list/height?network=${network}&height=${height}&strict=${
            strict ? '1' : ''
          }&type=${type}`
        : null,
    jsonFetcher,
    config,
  )
}

export function useListByAddress<T extends Type>(
  type: T,
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
        return `/api/list/address?network=${network}&address=${address}&height=${
          BigInt(last(previousPageData)!.height) - BigInt(1)
        }&type=${type}`
      }
      return `/api/list/address?network=${network}&address=${address}&type=${type}`
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
      const info = await call(network, 'chain.info', [])
      return jsonFetcher(
        `/api/list/height?network=${network}&height=${info.head.number}&type=${type}`,
      )
    },
    config,
  )
}
