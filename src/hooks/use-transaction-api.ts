import useSWR, { SWRConfiguration } from 'swr'

import { ENDPOINT } from '../constants'
import { useNetwork } from '../contexts/network'
import { jsonFetcher } from '../utils/fetcher'
import { Transaction } from '../utils/types'

export function useTransaction(hash?: string) {
  const network = useNetwork()
  return useSWR<Transaction>(
    hash ? `${ENDPOINT}/transaction/${network}/hash/${hash}` : null,
    jsonFetcher,
  )
}

export function usePendingTransaction(hash?: string) {
  const network = useNetwork()
  return useSWR<Transaction>(
    hash ? `${ENDPOINT}/transaction/pending_txn/get/${network}/${hash}` : null,
    jsonFetcher,
  )
}

export function useTransactionList(page?: number, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{
    contents: Transaction[]
    total: number
  }>(page ? `${ENDPOINT}/transaction/list/${network}/page/${page}` : null, jsonFetcher, config)
}

export function usePendingTransactionList(page?: number, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{
    contents: Transaction[]
    total: number
  }>(
    page ? `${ENDPOINT}/transaction/pending_txns/${network}/page/${page}` : null,
    jsonFetcher,
    config,
  )
}

export function useAddressTransactions(hash?: string) {
  const network = useNetwork()
  return useSWR<{
    contents?: Transaction[]
    total: number
  }>(
    hash ? `${ENDPOINT}/transaction/${network}/byAddress/${hash.toLowerCase()}` : null,
    jsonFetcher,
  )
}
