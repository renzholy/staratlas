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

export const Block = Type.Object({
  header: BlockHeader,
  body: Type.Object({
    Full: Type.Array(SignedUserTransaction),
  }),
  uncles: Type.Array(BlockHeader),
})

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
