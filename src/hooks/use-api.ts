import last from 'lodash/last'
import useSWR, { SWRConfiguration } from 'swr'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import { jsonFetcher } from 'utils/fetcher'
import { jsonRpc } from 'utils/json-rpc'
import useNetwork from './use-network'

type TransactionList = { _id: string; height: string; sender?: string }[]

export function useTransactionsByHeight(height?: BigInt, config?: SWRInfiniteConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<TransactionList>(
    height !== undefined
      ? (_, previousPageData) => {
          if (previousPageData && !previousPageData.length) {
            return null
          }
          if (previousPageData) {
            return `/api/transactions-by-height?network=${network}&height=${
              BigInt(last(previousPageData)!.height) - BigInt(1)
            }`
          }
          return `/api/transactions-by-height?network=${network}&height=${height}`
        }
      : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionsByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWRInfinite<TransactionList>(
    address
      ? (_, previousPageData) => {
          if (previousPageData && !previousPageData.length) {
            return null
          }
          if (previousPageData) {
            return `/api/transactions-by-address?network=${network}&address=${address}&height=${
              BigInt(last(previousPageData)!.height) - BigInt(1)
            }`
          }
          return `/api/transactions-by-address?network=${network}&address=${address}`
        }
      : null,
    jsonFetcher,
    config,
  )
}

export function useLatestTransactions(config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<TransactionList>(
    [network, 'latest'],
    async () => {
      const info = await jsonRpc(network, 'chain.info')
      return jsonFetcher(
        `/api/transactions-by-height?network=${network}&height=${info.head.number}`,
      )
    },
    config,
  )
}
