import useSWR from 'swr'
import { Network } from 'utils/types'

export function useBlockList(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list?network=${network}&height=${height}&type=block`,
  )
}

export function useTransactionList(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; sender?: string }>(
    `/api/list?network=${network}&height=${height}&type=transaction`,
  )
}

export function useUncleList(network: Network, height: BigInt) {
  return useSWR<{ _id: string; height: string; author: string }>(
    `/api/list?network=${network}&height=${height}&type=uncle`,
  )
}
