/* eslint-disable no-console */

import { jsonRpc } from 'utils/json-rpc'
import { Network } from 'utils/types'
import flatMap from 'lodash/flatMap'
import { Long, Binary } from 'bson'
import Bluebird from 'bluebird'
import { arrayify } from 'utils/encoding'
import difference from 'lodash/difference'
import { RPC_BLOCK_LIMIT } from 'utils/constants'
import { MongoServerError } from 'mongodb'
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
      $lte: new Long(top),
      $gte: new Long(bottom),
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
  const blocks = await jsonRpc(
    network,
    'chain.get_blocks_by_number',
    parseInt(top.toString(), 10),
    RPC_BLOCK_LIMIT,
  )
  const hashes = flatMap(blocks, (block) => block.body.Hashes)
  console.log('load', network, top, blocks.length, hashes.length)
  const transactions = flatMap(
    await Bluebird.map(
      blocks,
      (block) => jsonRpc(network, 'chain.get_block_by_hash', block.header.block_hash),
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
    (transaction) => jsonRpc(network, 'chain.get_transaction', transaction),
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
          height: new Long(block.header.number),
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
          height: new Long(transaction.block.number),
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
          height: new Long(transaction.block_number),
          sender: transaction.user_transaction
            ? new Binary(arrayify(transaction.user_transaction?.raw_txn.sender))
            : undefined,
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
  if (blockOperations.length) {
    try {
      await collections[network].blocks.bulkWrite(blockOperations)
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        const height = err.message.match(/dup key: \{ height: (\d+) \}/)?.[1]
        if (height) {
          await collections[network].blocks.deleteOne({ height: new Long(height) })
        }
      }
      throw err
    }
  }
}

/**
 * start a maintenance job
 */
export async function maintenance(network: Network, height?: bigint) {
  const top = height || BigInt((await jsonRpc(network, 'chain.info')).head.number)
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
