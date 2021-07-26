import {
  BlockHeaderView,
  BlockMetadataView,
  BlockNumber,
  EventKey,
  HashValue,
  HexString,
  RawUserTransactionView,
  SignedUserTransactionView,
  TransactionAuthenticator,
  TransactionVMStatus,
  U256,
  U64,
} from '@starcoin/starcoin/dist/src/types'

export interface Block {
  body: {
    Full: (RawUserTransactionView & {
      authenticator: TransactionAuthenticator
      transaction_hash: HashValue
    })[]
  }
  header: BlockHeaderView & { difficulty_number: U256; timestamp: string }
  uncles: (BlockHeaderView & { difficulty_number: U256; timestamp: string })[]
}

export interface Event {
  block_hash: HashValue
  block_number: BlockNumber
  transaction_hash: HashValue
  transaction_index: U64
  data: HexString
  type_tag: string
  event_key: EventKey
  event_seq_number: U64
}

export type Transaction = {
  block_hash: HashValue
  block_number: BlockNumber
  event_root_hash: HashValue
  events: Event[]
  gas_used: U64
  state_root_hash: HashValue
  status: TransactionVMStatus
  timestamp: U64
  transaction_hash: HashValue
  transaction_index: U64
} & ({ block_metadata: BlockMetadataView } | { user_transaction: SignedUserTransactionView })
