import { Type } from '@sinclair/typebox'

export const TransactionBlockInfo = Type.Object({
  block_hash: Type.String(),
  block_number: Type.String(),
  transaction_hash: Type.String(),
  transaction_index: Type.Integer(),
})

export const RawUserTransaction = Type.Object({
  sender: Type.String(),
  sequence_number: Type.String(),
  payload: Type.String(),
  max_gas_amount: Type.String(),
  gas_unit_price: Type.String(),
  gas_token_code: Type.String(),
  expiration_timestamp_secs: Type.String(),
  chain_id: Type.Integer(),
})

export const TransactionAuthenticator = Type.Union([
  Type.Object({
    Ed25519: Type.Object({
      public_key: Type.String(),
      signature: Type.String(),
    }),
  }),
  Type.Object({
    MultiEd25519: Type.Object({
      public_key: Type.String(),
      signature: Type.String(),
    }),
  }),
])

export const SignedUserTransaction = Type.Object({
  transaction_hash: Type.String(),
  raw_txn: RawUserTransaction,
  authenticator: TransactionAuthenticator,
})

export const BlockHeader = Type.Object({
  block_hash: Type.String(),
  parent_hash: Type.String(),
  timestamp: Type.String(),
  number: Type.String(),
  author: Type.String(),
  txn_accumulator_root: Type.String(),
  block_accumulator_root: Type.String(),
  state_root: Type.String(),
  gas_used: Type.String(),
  difficulty: Type.String(),
  nonce: Type.Integer(),
  body_hash: Type.String(),
  chain_id: Type.Integer(),
})

export const BlockSummary = Type.Object({
  header: BlockHeader,
  uncles: Type.Array(BlockHeader),
})

export const Block = Type.Intersect([
  BlockSummary,
  Type.Object({
    body: Type.Object({
      Full: Type.Array(SignedUserTransaction),
    }),
  }),
])

export const BlockSimple = Type.Intersect([
  BlockSummary,
  Type.Object({
    body: Type.Object({
      Hashes: Type.Array(Type.String()),
    }),
  }),
])

export const AbortLocation = Type.Union([
  Type.Literal('Script'),
  Type.Object({
    Module: Type.Object({
      address: Type.String(),
      name: Type.String(),
    }),
  }),
])

export const TransactionStatus = Type.Union([
  Type.Literal('Executed'),
  Type.Literal('OutOfGas'),
  Type.Literal('MiscellaneousError'),
  Type.Object({
    MoveAbort: Type.Object({
      location: AbortLocation,
      abort_code: Type.Integer(),
    }),
  }),
  Type.Object({
    ExecutionFailure: Type.Object({
      location: AbortLocation,
      function: Type.Integer(),
      code_offset: Type.Integer(),
    }),
  }),
  Type.Object({
    Discard: Type.Object({
      status_code: Type.Integer(),
    }),
  }),
])

export const TransactionInfo = Type.Intersect([
  TransactionBlockInfo,
  Type.Object({
    state_root_hash: Type.String(),
    event_root_hash: Type.String(),
    gas_used: Type.String(),
    status: TransactionStatus,
  }),
])

export const TransactionEvent = Type.Intersect([
  TransactionBlockInfo,
  Type.Object({
    data: Type.String(),
    type_tag: Type.String(),
    event_key: Type.String(),
    event_seq_number: Type.String(),
  }),
])

export const EventFilter = Type.Partial(
  Type.Object({
    event_keys: Type.Array(Type.String()),
    limit: Type.Integer(),
    from_block: Type.Integer(),
    to_block: Type.Integer(),
  }),
)

export const EventHandle = Type.Object({
  count: Type.Integer(),
  key: Type.String(),
})

export const Epoch = Type.Object({
  number: Type.Integer(),
  start_time: Type.Integer(),
  start_block_number: Type.Integer(),
  end_block_number: Type.Integer(),
  block_time_target: Type.Integer(),
  reward_per_block: Type.Integer(),
  reward_per_uncle_percent: Type.Integer(),
  block_difficulty_window: Type.Integer(),
  max_uncles_per_block: Type.Integer(),
  block_gas_limit: Type.Integer(),
  strategy: Type.Integer(),
  new_epoch_events: EventHandle,
})

export const EpochData = Type.Object({
  uncles: Type.Integer(),
  total_reward: Type.Integer(),
  total_gas: Type.Integer(),
})

export const EpochInfo = Type.Object({
  epoch: Epoch,
  epoch_data: EpochData,
})

export const GlobalTimeOnChain = Type.Object({
  milliseconds: Type.Integer(),
})

export const EpochSummary = Type.Object({
  uncles: Type.String(),
  sum: Type.String(),
  avg: Type.String(),
  time_sum: Type.String(),
  time_avg: Type.String(),
})

export const EpochUncleSummary = Type.Object({
  epoch: Type.String(),
  number_summary: EpochSummary,
  epoch_summary: EpochSummary,
})

export const AccumulatorInfo = Type.Object({
  accumulator_root: Type.String(),
  frozen_subtree_roots: Type.Array(Type.String()),
  num_leaves: Type.Integer(),
  num_nodes: Type.Integer(),
})

export const ChainInfo = Type.Object({
  chain_id: Type.Integer(),
  genesis_hash: Type.String(),
  head: BlockHeader,
  block_info: Type.Object({
    block_id: Type.String(),
    total_difficulty: Type.String(),
    txn_accumulator_info: AccumulatorInfo,
    block_accumulator_info: AccumulatorInfo,
  }),
})

export default {
  'chain.id': {
    params: Type.Tuple([]),
    result: Type.Object({
      name: Type.String(),
      id: Type.Integer(),
    }),
  },
  'chain.info': {
    params: Type.Tuple([]),
    result: ChainInfo,
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
    params: Type.Tuple([Type.Integer(), Type.Integer({ maximum: 32 })]),
    result: Type.Array(BlockSimple),
  },
  'chain.get_headers': {
    params: Type.Tuple([Type.Array(Type.String())]),
    result: Type.Array(BlockHeader),
  },
  'chain.get_transaction': {
    params: Type.Tuple([Type.String()]),
    result: Type.Intersect([
      TransactionBlockInfo,
      Type.Object({ user_transaction: Type.Union([SignedUserTransaction, Type.Null()]) }),
    ]),
  },
  'chain.get_transaction_info': {
    params: Type.Tuple([Type.String()]),
    result: TransactionInfo,
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
  'chain.epoch': {
    params: Type.Tuple([]),
    result: EpochInfo,
  },
  'chain.get_epoch_info_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: EpochInfo,
  },
  'chain.get_global_time_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: GlobalTimeOnChain,
  },
  'chain.get_epoch_uncles_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: Type.Array(BlockSummary),
  },
  'chain.epoch_uncle_summary_by_number': {
    params: Type.Tuple([Type.Integer()]),
    result: EpochUncleSummary,
  },
}
