/* eslint-disable no-console */

import { call } from 'utils/json-rpc'
import { Network } from 'utils/types'
import flatMap from 'lodash/flatMap'
import { Decimal128, Binary } from 'bson'
import Bluebird from 'bluebird'
import { arrayify } from 'utils/encoding'
import difference from 'lodash/difference'
import { RPC_BLOCK_LIMIT } from 'utils/constants'
import { collections } from './mongo'

const MAINTENANCE_SIZE = 8

class AbortError extends Error {}

/**
 * find a index range between top & bottom that has gaps
 */
async function find(network: Network, top: bigint, bottom: bigint = BigInt(0), depth: number = 0) {
  if (top <= bottom) {
    return
  }
  const count = await collections[network].blocks.countDocuments({
    height: {
      $lte: new Decimal128(top.toString()),
      $gte: new Decimal128(bottom.toString()),
    },
  })
  console.log('find', network, top, bottom, top - bottom + BigInt(1), count, depth)
  if (top - bottom + BigInt(1) > count) {
    if (top - bottom + BigInt(1) < RPC_BLOCK_LIMIT * MAINTENANCE_SIZE) {
      throw new AbortError(top.toString())
    }
    const mid = (top - bottom) / BigInt(2) + bottom
    await find(network, top, mid, depth + 1)
    await find(network, mid, bottom, depth + 1)
  }
}

/**
 * fetch data from top to top + RPC_API_BLOCK_LIMIT and load them into database
 */
export async function load(network: Network, top: BigInt) {
  const blocks = await call(network, 'chain.get_blocks_by_number', [
    parseInt(top.toString(), 10),
    RPC_BLOCK_LIMIT,
  ])
  const uncles = flatMap(blocks, (block) => block.uncles)
  const hashes = flatMap(blocks, (block) => block.body.Hashes)
  console.log('load', network, top, blocks.length, uncles.length, hashes.length)
  const transactions = flatMap(
    await Bluebird.map(
      blocks,
      (block) => call(network, 'chain.get_block_by_hash', [block.header.block_hash]),
      { concurrency: 4 },
    ),
    (block) => block.body.Full.map((transaction) => ({ ...transaction, block: block.header })),
  )
  // 'chain.get_block_by_hash' does not return blockMeta transactions
  const blockMetaTransactionHashes = difference(
    flatMap(blocks, (block) => block.body.Hashes),
    transactions.map((transaction) => transaction.transaction_hash),
  )
  const blockMetaTransactions = await Bluebird.map(
    blockMetaTransactionHashes,
    (transaction) => call(network, 'chain.get_transaction', [transaction]),
    { concurrency: 4 },
  )
  const blockOperations = blocks.map((block) => ({
    updateOne: {
      filter: {
        _id: new Binary(arrayify(block.header.block_hash)),
      },
      update: {
        $set: {
          _id: new Binary(arrayify(block.header.block_hash)),
          height: new Decimal128(block.header.number),
          author: new Binary(arrayify(block.header.author)),
        },
      },
      upsert: true,
    },
  }))
  const transactionOperations = transactions.map((transaction) => ({
    updateOne: {
      filter: {
        _id: new Binary(arrayify(transaction.transaction_hash)),
      },
      update: {
        $set: {
          _id: new Binary(arrayify(transaction.transaction_hash)),
          height: new Decimal128(transaction.block.number),
          sender: transaction.raw_txn
            ? new Binary(arrayify(transaction.raw_txn.sender))
            : undefined,
        },
      },
      upsert: true,
    },
  }))
  const blockMetaTransactionOperations = blockMetaTransactions.map((transaction) => ({
    updateOne: {
      filter: {
        _id: new Binary(arrayify(transaction.transaction_hash)),
      },
      update: {
        $set: {
          _id: new Binary(arrayify(transaction.transaction_hash)),
          height: new Decimal128(transaction.block_number),
          sender: transaction.user_transaction
            ? new Binary(arrayify(transaction.user_transaction?.raw_txn.sender))
            : undefined,
        },
      },
      upsert: true,
    },
  }))
  const uncleOperations = uncles.map((uncle) => ({
    updateOne: {
      filter: {
        _id: new Binary(arrayify(uncle.block_hash)),
      },
      update: {
        $set: {
          _id: new Binary(arrayify(uncle.block_hash)),
          height: new Decimal128(uncle.number),
          author: new Binary(arrayify(uncle.author)),
        },
      },
      upsert: true,
    },
  }))
  if (transactionOperations.length) {
    await collections[network].transactions.bulkWrite(transactionOperations)
  }
  if (blockMetaTransactionOperations.length) {
    await collections[network].transactions.bulkWrite(blockMetaTransactionOperations)
  }
  if (uncleOperations.length) {
    await collections[network].uncles.bulkWrite(uncleOperations)
  }
  if (blockOperations.length) {
    await collections[network].blocks.bulkWrite(blockOperations)
  }
}

/**
 * start a maintenance job
 */
export async function maintenance(network: Network, height?: bigint) {
  const top = height || BigInt((await call(network, 'chain.info', [])).head.number)
  try {
    await find(network, top)
    return null
  } catch (err) {
    if (err instanceof AbortError) {
      await Promise.all(
        Array.from({ length: MAINTENANCE_SIZE }).map((_, index) =>
          load(network, BigInt(err.message) - BigInt(index * RPC_BLOCK_LIMIT)),
        ),
      )
      return BigInt(err.message)
    }
    throw err
  }
}
