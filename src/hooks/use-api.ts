import last from 'lodash/last'
import useSWR, { SWRConfiguration, SWRInfiniteConfiguration, useSWRInfinite } from 'swr'
import { jsonFetcher } from 'utils/fetcher'
import { call } from 'utils/json-rpc'
import useNetwork from './use-network'

export function useBlockByHash(hash?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }>(
    hash ? `/api/list/hash?network=${network}&height=${hash}&type=block` : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionByHash(hash?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; sender?: string }>(
    hash ? `/api/list/hash?network=${network}&height=${hash}&type=transaction` : null,
    jsonFetcher,
    config,
  )
}

export function useUncleByHash(hash?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }>(
    hash ? `/api/list/hash?network=${network}&height=${hash}&type=uncle` : null,
    jsonFetcher,
    config,
  )
}

export function useBlocksByHeight(
  height?: BigInt,
  strict?: boolean,
  config?: SWRInfiniteConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; author: string }[]>(
    (_, previousPageData) =>
      previousPageData?.length
        ? `/api/list/height?network=${network}&height=${
            BigInt(last(previousPageData)!.height) - BigInt(1)
          }&strict=${strict ? '1' : ''}&type=block`
        : height !== undefined
        ? `/api/list/height?network=${network}&height=${height}&strict=${
            strict ? '1' : ''
          }&type=block`
        : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionsByHeight(
  height?: BigInt,
  strict?: boolean,
  config?: SWRInfiniteConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; sender?: string }[]>(
    (_, previousPageData) =>
      previousPageData?.length
        ? `/api/list/height?network=${network}&height=${
            BigInt(last(previousPageData)!.height) - BigInt(1)
          }&strict=${strict ? '1' : ''}&type=transaction`
        : height !== undefined
        ? `/api/list/height?network=${network}&height=${height}&strict=${
            strict ? '1' : ''
          }&type=transaction`
        : null,
    jsonFetcher,
    config,
  )
}

export function useUnclesByHeight(
  height?: BigInt,
  strict?: boolean,
  config?: SWRInfiniteConfiguration,
) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; author: string }[]>(
    (_, previousPageData) =>
      previousPageData?.length
        ? `/api/list/height?network=${network}&height=${
            BigInt(last(previousPageData)!.height) - BigInt(1)
          }&strict=${strict ? '1' : ''}&type=uncle`
        : height !== undefined
        ? `/api/list/height?network=${network}&height=${height}&strict=${
            strict ? '1' : ''
          }&type=uncle`
        : null,
    jsonFetcher,
    config,
  )
}

export function useBlocksByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; author: string }[]>(
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
        }&type=block`
      }
      return `/api/list/address?network=${network}&address=${address}&type=block`
    },
    jsonFetcher,
    config,
  )
}

export function useTransactionsByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; sender?: string }[]>(
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
        }&type=transaction`
      }
      return `/api/list/address?network=${network}&address=${address}&type=transaction`
    },
    jsonFetcher,
    config,
  )
}

export function useUnclesByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<{ _id: string; height: string; author: string }[]>(
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
        }&type=uncle`
      }
      return `/api/list/address?network=${network}&address=${address}&type=uncle`
    },
    jsonFetcher,
    config,
  )
}

export function useBlocksLatest(config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }[]>(
    [network, 'blocks', 'latest'],
    async () => {
      const info = await call(network, 'chain.info', [])
      return jsonFetcher(
        `/api/list/height?network=${network}&height=${info.head.number}&type=block`,
      )
    },
    config,
  )
}

export function useTransactionsLatest(config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; sender?: string }[]>(
    [network, 'transactions', 'latest'],
    async () => {
      const info = await call(network, 'chain.info', [])
      return jsonFetcher(
        `/api/list/height?network=${network}&height=${info.head.number}&type=transaction`,
      )
    },
    config,
  )
}
