export namespace RPC {
  export declare type Identifier = string
  export declare type AccountAddress = string
  export declare type HashValue = string
  export declare type U8 = number
  export declare type U16 = string
  export declare type U64 = string
  export declare type U128 = string
  export declare type U256 = string
  export declare type I64 = string
  export declare type BlockNumber = string
  export declare type AuthenticationKey = string
  export declare type Ed25519PublicKey = string
  export declare type Ed25519Signature = string
  export declare type MultiEd25519PublicKey = string
  export declare type MultiEd25519Signature = string
  export declare type EventKey = string
  export declare type HexString = string
  export interface StructTag {
    address: string
    module: string
    name: string
    type_params?: TypeTag[]
  }
  export declare type TypeTag =
    | 'Bool'
    | 'U8'
    | 'U64'
    | 'U128'
    | 'Address'
    | 'Signer'
    | {
        Vector: TypeTag
      }
    | {
        Struct: StructTag
      }
  export declare function formatStructTag(structTag: StructTag): string
  export declare function formatTypeTag(typeTag: TypeTag): string
  export interface ChainId {
    id: U8
  }
  interface Script {
    code: HexString
    ty_args: TypeTag[]
    args: HexString[]
  }
  interface ScriptFunction {
    func: FunctionId
    ty_args: TypeTag[]
    args: HexString[]
  }
  interface Module {
    code: HexString
  }
  interface Package {
    package_address: AccountAddress
    modules: Module[]
    init_script?: ScriptFunction
  }
  export declare type TransactionPayload =
    | {
        Script: Script
      }
    | {
        Package: Package
      }
    | {
        ScriptFunction: ScriptFunction
      }
  export declare type SignatureType = 'Ed25519' | 'MultiEd25519'
  export declare type TransactionAuthenticator =
    | {
        Ed25519: {
          public_key: Ed25519PublicKey
          signature: Ed25519Signature
        }
      }
    | {
        MultiEd25519: {
          public_key: MultiEd25519PublicKey
          signature: MultiEd25519Signature
        }
      }
  export interface AnnotatedMoveStruct {
    type_: string
    value: [Identifier, AnnotatedMoveValue][]
  }
  export declare type AnnotatedMoveValue =
    | {
        U8: number
      }
    | {
        U64: string
      }
    | {
        U128: string
      }
    | {
        Bool: boolean
      }
    | {
        Address: AccountAddress
      }
    | {
        Bytes: HexString
      }
    | {
        Vector: AnnotatedMoveValue[]
      }
    | {
        Struct: AnnotatedMoveStruct
      }
  export declare type MoveStruct = {
    [key in Identifier]: MoveValue
  }
  export declare type MoveValue =
    | number
    | bigint
    | boolean
    | AccountAddress
    | HexString
    | MoveValue[]
    | MoveStruct
  export interface EventHandle {
    count: U64
    key: EventKey
  }
  export interface Epoch {
    number: U64
    start_time: U64
    start_block_number: U64
    end_block_number: U64
    block_time_target: U64
    reward_per_block: U128
    reward_per_uncle_percent: U64
    block_difficulty_window: U64
    max_uncles_per_block: U64
    block_gas_limit: U64
    strategy: U8
    new_epoch_events: EventHandle
  }
  export interface EpochData {
    uncles: U64
    total_reward: U128
    total_gas: U128
  }
  export interface EpochInfo {
    epoch: Epoch
    epoch_data: EpochData
  }
  export interface Event {
    block_hash?: HashValue
    block_number?: BlockNumber
    transaction_hash?: HashValue
    transaction_index?: U64
    data: Uint8Array
    type_tags: TypeTag
    event_key: EventKey
    event_seq_number: U64
  }
  export interface TypeArgumentABI {
    name: string
  }
  export interface ArgumentABI {
    name: string
    type_tag: TypeTag
  }
  export interface ScriptABI {
    name: string
    doc: string
    code: Uint8Array
    ty_args: TypeArgumentABI[]
    args: ArgumentABI[]
  }
  export declare type AbortLocation =
    | 'Script'
    | {
        Module: {
          address: AccountAddress
          name: Identifier
        }
      }
  export declare type TransactionVMStatus =
    | 'Executed'
    | 'OutOfGas'
    | 'MiscellaneousError'
    | {
        MoveAbort: {
          location: AbortLocation
          abort_code: U64
        }
      }
    | {
        ExecutionFailure: {
          location: AbortLocation
          function: U16
          code_offset: U16
        }
      }
    | {
        Discard: {
          status_code: U64
        }
      }
  export interface ReceiptIdentifierView {
    accountAddress: string
    authKey: string
  }
  export interface RawUserTransactionView {
    sender: AccountAddress
    sequence_number: U64
    payload: HexString
    max_gas_amount: U64
    gas_unit_price: U64
    gas_token_code: string
    expiration_timestamp_secs: U64
    chain_id: U8
  }
  export interface BlockMetadataView {
    parent_hash: HashValue
    timestamp: U64
    author: AccountAddress
    author_auth_key?: AuthenticationKey
    uncles: U64
    number: BlockNumber
    chain_id: U8
    parent_gas_used: U64
  }
  export interface SignedUserTransactionView {
    transaction_hash: HashValue
    raw_txn: RawUserTransactionView
    authenticator: TransactionAuthenticator
  }
  export declare type BlockTag = string | number
  export declare type ModuleId =
    | string
    | {
        address: AccountAddress
        name: Identifier
      }
  export declare type FunctionId =
    | string
    | {
        address: AccountAddress
        module: Identifier
        functionName: Identifier
      }
  export interface CallRequest {
    function_id: FunctionId
    type_args?: string[]
    args?: string[]
  }
  export declare function formatFunctionId(functionId: FunctionId): string
  export declare function parseFunctionId(functionId: FunctionId): {
    address: AccountAddress
    module: Identifier
    functionName: Identifier
  }
  export interface BlockHeaderView {
    block_hash: HashValue
    parent_hash: HashValue
    timestamp: U64
    number: BlockNumber
    author: AccountAddress
    author_auth_key?: AuthenticationKey
    txn_accumulator_root: HashValue
    block_accumulator_root: HashValue
    state_root: HashValue
    gas_used: U64
    difficulty: U256
    nonce: U64
    body_hash: HashValue
    chain_id: U8
  }
  interface BlockCommon {
    header: BlockHeaderView
    confirmations?: number
  }
  export interface BlockWithTxnHashes extends BlockCommon {
    transactions: HashValue[]
  }
  export interface BlockWithTransactions extends BlockCommon {
    transactions: Array<SignedUserTransactionView>
  }
  export interface BlockView extends BlockCommon {
    transactions: Array<HashValue | SignedUserTransactionView>
  }
  export interface TxnBlockInfo {
    block_hash: HashValue
    block_number: BlockNumber
    transaction_hash: HashValue
    transaction_index: number
  }
  export interface TransactionEventView extends TxnBlockInfo {
    data: HexString
    type_tags: TypeTag
    event_key: EventKey
    event_seq_number: U64
  }
  export interface AccessPath {
    address: AccountAddress
    path: HexString
  }
  export declare type WriteOp =
    | 'Deletion'
    | {
        Value: HexString
      }
  export interface TransactionWriteAction extends AccessPath {
    action: WriteOp
  }
  export interface TransactionOutput {
    gas_used: U64
    delta_size: I64
    status: TransactionVMStatus
    events: TransactionEventView[]
    write_set: TransactionWriteAction[]
  }
  export interface TransactionInfoView extends TxnBlockInfo {
    state_root_hash: HashValue
    event_root_hash: HashValue
    gas_used: U64
    status: TransactionVMStatus
    txn_events?: Array<TransactionEventView>
    confirmations: number
  }
  export interface TransactionResponse extends SignedUserTransactionView {
    block_number?: BlockNumber
    block_hash?: HashValue
    confirmations: number
    wait: (confirmations?: number) => Promise<TransactionInfoView>
  }
  export interface EventFilter {
    event_keys?: EventKey[]
    limit?: number
  }
  export interface Filter extends EventFilter {
    from_block?: BlockNumber
    to_block?: BlockNumber
  }
  export interface OnchainEvent<T> {
    address: AccountAddress
    eventId: U64
    eventSequenceNumber: U64
    eventData: T
  }
  export interface AcceptTokenEvent {
    token_code: TokenCode
  }
  export interface TokenCode {
    address: AccountAddress
    module: string
    name: string
  }
  export interface BlockRewardEvent {
    block_number: U64
    block_reward: U128
    gas_fees: U128
    miner: AccountAddress
  }
  export interface BurnEvent {
    amount: U128
    token_code: TokenCode
  }
  export interface MintEvent {
    amount: U128
    token_code: TokenCode
  }
  export interface DepositEvent {
    amount: U128
    token_code: TokenCode
    metadata: U8[]
  }
  export interface WithdrawEvent {
    amount: U128
    token_code: TokenCode
    metadata: U8[]
  }
  export interface NewBlockEvent {
    number: U64
    author: AccountAddress
    timestamp: U64
    uncles: U64
  }
  export interface ProposalCreatedEvent {
    proposal_id: U64
    proposer: AccountAddress
  }
  export interface VoteChangedEvent {
    proposal_id: U64
    proposer: AccountAddress
    voter: AccountAddress
    agree: boolean
    vote: U128
  }
}
