import useSWR from 'swr'
import { Type, Static } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv/dist/2019'
import { useMemo } from 'react'

import { useNetwork } from '../contexts/network'
import {
  Block,
  BlockHeader,
  EpochInfo,
  EpochUncleSummary,
  EventFilter,
  GlobalTimeOnChain,
  SignedUserTransaction,
  TransactionBlockInfo,
  TransactionEvent,
  TransactionInfo,
} from '../utils/json-rpc-types'

const ajv = addFormats(new Ajv()).addKeyword('kind').addKeyword('modifier')

const API = {
  'chain.id': {
    params: Type.Tuple([]),
    result: Type.Object({
      name: Type.String(),
      id: Type.Integer(),
    }),
  },
  'chain.get_block_by_hash': {
    params: Type.Tuple([Type.String()]),
    result: Block,
  },
  'chain.get_block_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: Block,
  },
  'chain.get_blocks_by_number': {
    params: Type.Tuple([Type.Integer(), Type.Integer()]),
    result: Type.Array(Block),
  },
  'chain.get_transaction': {
    params: Type.Tuple([Type.String()]),
    result: Type.Intersect([
      TransactionBlockInfo,
      Type.Object({ user_transaction: SignedUserTransaction }),
    ]),
  },
  'chain.get_block_txn_infos': {
    params: Type.Tuple([Type.String()]),
    result: Type.Array(TransactionInfo),
  },
  'chain.get_events_by_txn_hash': {
    params: Type.Tuple([Type.String()]),
    result: Type.Array(TransactionEvent),
  },
  'chain.get_events': {
    params: Type.Tuple([EventFilter]),
    result: Type.Array(TransactionEvent),
  },
  'chain.get_headers': {
    params: Type.Tuple([Type.Array(Type.String())]),
    result: Type.Array(BlockHeader),
  },
  'chain.get_epoch_uncles_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: Type.Array(
      Type.Object({
        header: BlockHeader,
        uncles: Type.Array(BlockHeader),
      }),
    ),
  },
  'chain.epoch': {
    params: Type.Tuple([]),
    result: Type.Array(EpochInfo),
  },
  'chain.get_epoch_info_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: EpochInfo,
  },
  'chain.get_global_time_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: GlobalTimeOnChain,
  },
  'chain.epoch_uncle_summary_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: EpochUncleSummary,
  },
}

export function useJsonRpc<T extends keyof typeof API>(
  method: T,
  ...params: Static<typeof API[T]['params']>
) {
  const network = useNetwork()
  const key = useMemo(() => [network, method, JSON.stringify(params)], [method, network, params])
  return useSWR<Static<typeof API[T]['result']>>(key, () =>
    fetch(`https://${network}-seed.starcoin.org`, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 0 }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if ('result' in json) {
          if (ajv.validate(API[method].result, json.result)) {
            return json.result
          }
          throw new Error(ajv.errorsText(ajv.errors))
        }
        if ('error' in json && 'message' in json.error) {
          throw new Error(json.error.message)
        }
        throw new Error('unknown json rpc error')
      }),
  )
}
