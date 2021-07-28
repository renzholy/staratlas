import useSWR from 'swr'
import { Network } from 'utils/types'

export function useBlocksByHeight(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list/height?network=${network}&height=${height}&type=block`,
  )
}

export function useTransactionsByHeight(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; sender?: string }>(
    `/api/list/height?network=${network}&height=${height}&type=transaction`,
  )
}

export function useUnclesByHeight(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list/height?network=${network}&height=${height}&type=uncle`,
  )
}

export function useBlocksByAddress(network: Network, address: string) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list/address?network=${network}&address=${address}&type=block`,
  )
}

export function useTransactionsByAddress(network: Network, address: string) {
  return useSWR<{ _id: string; height: string; sender?: string }>(
    `/api/list/address?network=${network}&address=${address}&type=transaction`,
  )
}

export function useUnclesByAddress(network: Network, address: string) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list/address?network=${network}&address=${address}&type=uncle`,
  )
}
