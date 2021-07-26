import useSWR from 'swr'

import { useNetwork } from '../contexts/network'
import { RPC } from '../utils/json-rpc-types'

export function useJsonRpc<T extends keyof API>(method: T, ...params: API[T]['params']) {
  const network = useNetwork()
  return useSWR<{
    jsonrpc: '2.0'
    result: API[T]['result']
    id: 0
  }>([network, method, JSON.stringify(params)], () =>
    fetch(`https://${network}-seed.starcoin.org`, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 0 }),
    }).then((response) => response.json()),
  )
}

type API = {
  'chain.id': {
    params: []
    result: {
      name: string
      id: number
    }
  }
  'chain.get_block_by_hash': {
    params: [string]
    result: {
      header: RPC.BlockHeaderView
      body: {
        Full: RPC.SignedUserTransactionView[]
      }
      uncles: RPC.BlockHeaderView[]
    }
  }
  'chain.get_block_by_number': {
    params: [number]
    result: {
      header: RPC.BlockHeaderView
      body: {
        Full: RPC.SignedUserTransactionView[]
      }
      uncles: RPC.BlockHeaderView[]
    }
  }
  'chain.get_transaction': {
    params: [string]
    result: RPC.TxnBlockInfo & {
      user_transaction: RPC.SignedUserTransactionView
    }
  }
  'chain.get_block_txn_infos': {
    params: [string]
    result: RPC.TransactionInfoView[]
  }
  'chain.get_events_by_txn_hash': {
    params: [string]
    result: RPC.TransactionEventView[]
  }
  'chain.get_epoch_uncles_by_number': {
    params: [number]
    result: {
      header: RPC.BlockHeaderView
      uncles: RPC.BlockHeaderView[]
    }[]
  }
}
