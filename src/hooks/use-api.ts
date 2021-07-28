import useSWR, { SWRConfiguration } from 'swr'
import { jsonFetcher } from 'utils/fetcher'
import useNetwork from './use-network'

export function useBlocksByHeight(height?: BigInt, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }[]>(
    height ? `/api/list/height?network=${network}&height=${height}&type=block` : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionsByHeight(height?: BigInt, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; sender?: string }[]>(
    height ? `/api/list/height?network=${network}&height=${height}&type=transaction` : null,
    jsonFetcher,
    config,
  )
}

export function useUnclesByHeight(height?: BigInt, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }[]>(
    height ? `/api/list/height?network=${network}&height=${height}&type=uncle` : null,
    jsonFetcher,
    config,
  )
}

export function useBlocksByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }[]>(
    address ? `/api/list/address?network=${network}&address=${address}&type=block` : null,
    jsonFetcher,
    config,
  )
}

export function useTransactionsByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; sender?: string }[]>(
    address ? `/api/list/address?network=${network}&address=${address}&type=transaction` : null,
    jsonFetcher,
    config,
  )
}

export function useUnclesByAddress(address?: string, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{ _id: string; height: string; author: string }[]>(
    address ? `/api/list/address?network=${network}&address=${address}&type=uncle` : null,
    jsonFetcher,
    config,
  )
}
