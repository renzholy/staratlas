import { Type } from '@sinclair/typebox'

const TransactionBlockInfo = Type.Object({
  block_hash: Type.String(),
  block_number: Type.String(),
  transaction_hash: Type.String(),
  transaction_index: Type.Integer(),
})

const RawUserTransaction = Type.Object({
  sender: Type.String(),
  sequence_number: Type.String(),
  payload: Type.String(),
  max_gas_amount: Type.String(),
  gas_unit_price: Type.String(),
  gas_token_code: Type.String(),
  expiration_timestamp_secs: Type.String(),
  chain_id: Type.Integer(),
})

const TransactionAuthenticator = Type.Union([
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

const SignedUserTransaction = Type.Object({
  transaction_hash: Type.String(),
  raw_txn: RawUserTransaction,
  authenticator: TransactionAuthenticator,
})

const BlockHeader = Type.Object({
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

const Block = Type.Object({
  header: BlockHeader,
  body: Type.Object({
    Full: Type.Array(SignedUserTransaction),
  }),
  uncles: Type.Array(BlockHeader),
})

const AbortLocation = Type.Union([
  Type.Literal('Script'),
  Type.Object({
    Module: Type.Object({
      address: Type.String(),
      name: Type.String(),
    }),
  }),
])

const TransactionStatus = Type.Union([
  Type.Literal('Executed'),
  Type.Literal('OutOfGas'),
  Type.Literal('MiscellaneousError'),
  Type.Object({
    MoveAbort: Type.Object({
      location: AbortLocation,
      abort_code: Type.String(),
    }),
  }),
  Type.Object({
    ExecutionFailure: Type.Object({
      location: AbortLocation,
      function: Type.String(),
      code_offset: Type.String(),
    }),
  }),
  Type.Object({
    Discard: Type.Object({
      status_code: Type.String(),
    }),
  }),
])

const TransactionInfo = Type.Intersect([
  TransactionBlockInfo,
  Type.Object({
    state_root_hash: Type.String(),
    event_root_hash: Type.String(),
    gas_used: Type.String(),
    status: TransactionStatus,
  }),
])

const TransactionEvent = Type.Intersect([
  TransactionBlockInfo,
  Type.Object({
    data: Type.String(),
    type_tag: Type.String(),
    event_key: Type.String(),
    event_seq_number: Type.String(),
  }),
])

const EventFilter = Type.Partial(
  Type.Object({
    event_keys: Type.Array(Type.String()),
    limit: Type.Integer(),
    from_block: Type.Integer(),
    to_block: Type.Integer(),
  }),
)

const EventHandle = Type.Object({
  count: Type.Integer(),
  key: Type.String(),
})

const Epoch = Type.Object({
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

const EpochData = Type.Object({
  uncles: Type.Integer(),
  total_reward: Type.Integer(),
  total_gas: Type.Integer(),
})

const EpochInfo = Type.Object({
  epoch: Epoch,
  epoch_data: EpochData,
})

const GlobalTimeOnChain = Type.Object({
  milliseconds: Type.Integer(),
})

const EpochSummary = Type.Object({
  uncles: Type.String(),
  sum: Type.String(),
  avg: Type.String(),
  time_sum: Type.String(),
  time_avg: Type.String(),
})

const EpochUncleSummary = Type.Object({
  epoch: Type.Integer(),
  number_summary: EpochSummary,
  epoch_summary: EpochSummary,
})

export default {
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
