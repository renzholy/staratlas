import useSWR, { SWRConfiguration } from 'swr'

import { ENDPOINT } from '../constants'
import { useNetwork } from '../contexts/network'
import { jsonFetcher } from '../utils/fetcher'
import { Block } from '../utils/types'

export function useBlock(hashOrHeight?: string) {
  const network = useNetwork()
  const isHash = hashOrHeight?.startsWith('0x')
  const isHeight = hashOrHeight && /^\d+$/.test(hashOrHeight)
  return useSWR<Block>(
    isHash
      ? `${ENDPOINT}/block/${network}/hash/${hashOrHeight}`
      : isHeight
      ? `${ENDPOINT}/block/${network}/height/${hashOrHeight}`
      : null,
    jsonFetcher,
  )
}

export function useBlockList(page?: number, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{
    contents: Block[]
    total: number
  }>(page ? `${ENDPOINT}/block/${network}/page/${page}` : null, jsonFetcher, config)
}

export function useUncleBlock(hashOrHeight?: string) {
  const network = useNetwork()
  const isHash = hashOrHeight?.startsWith('0x')
  const isHeight = hashOrHeight && /^\d+$/.test(hashOrHeight)
  return useSWR<Block>(
    isHash
      ? `${ENDPOINT}/block/${network}/uncle/hash/${hashOrHeight}`
      : isHeight
      ? `${ENDPOINT}/block/${network}/uncle/height/${hashOrHeight}`
      : null,
    jsonFetcher,
  )
}

export function useUncleBlockList(page?: number, config?: SWRConfiguration) {
  const network = useNetwork()
  return useSWR<{
    contents: Block[]
    total: number
  }>(page ? `${ENDPOINT}/block/${network}/uncle/page/${page}` : null, jsonFetcher, config)
}
