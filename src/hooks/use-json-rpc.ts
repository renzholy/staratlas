import useSWR from 'swr'
import { Type, Static } from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv/dist/2019'

import { useNetwork } from '../contexts/network'
import {
  BlockHeader,
  SignedUserTransaction,
  TransactionBlockInfo,
  TransactionEvent,
  TransactionInfo,
} from '../utils/json-rpc-types'

const ajv = addFormats(new Ajv({}), [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex',
])
  .addKeyword('kind')
  .addKeyword('modifier')

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
    result: Type.Object({
      header: BlockHeader,
      body: Type.Object({
        Full: Type.Array(SignedUserTransaction),
      }),
      uncles: Type.Array(BlockHeader),
    }),
  },
  'chain.get_block_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: Type.Object({
      header: BlockHeader,
      body: Type.Object({
        Full: Type.Array(SignedUserTransaction),
      }),
      uncles: Type.Array(BlockHeader),
    }),
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
  'chain.get_epoch_uncles_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: Type.Array(
      Type.Object({
        header: BlockHeader,
        uncles: Type.Array(BlockHeader),
      }),
    ),
  },
}

export function useJsonRpc<T extends keyof typeof API>(
  method: T,
  ...params: Static<typeof API[T]['params']>
) {
  const network = useNetwork()
  return useSWR<{
    jsonrpc: '2.0'
    result: Static<typeof API[T]['result']>
    id: 0
  }>([network, method, JSON.stringify(params)], () =>
    fetch(`https://${network}-seed.starcoin.org`, {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 0 }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (ajv.validate(API[method].result, json)) {
          return json
        }
        throw new Error(ajv.errorsText(ajv.errors))
      }),
  )
}
