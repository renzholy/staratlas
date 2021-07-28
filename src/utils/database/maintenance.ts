/* eslint-disable no-console */

import { call } from 'utils/json-rpc'
import { Network } from 'utils/types'
import flatMap from 'lodash/flatMap'
import { Decimal128, Binary } from 'bson'
import { arrayify } from 'ethers/lib/utils'
import { collections } from './mongo'

const PAGE_SIZE = 32

const MAINTENANCE_SIZE = 4

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
    if (top - bottom + BigInt(1) < PAGE_SIZE * MAINTENANCE_SIZE) {
      throw new AbortError(top.toString())
    }
    const mid = (top - bottom) / BigInt(2) + bottom
    if (Math.random() > 0.7) {
      await find(network, top, mid, depth + 1)
      await find(network, mid, bottom, depth + 1)
    } else {
      await find(network, mid, bottom, depth + 1)
      await find(network, top, mid, depth + 1)
    }
  }
}

/**
 * fetch data from top to top + PAGE_SIZE and load them into database
 */
export async function load(network: Network, top: BigInt) {
  console.log('load', network, top)
  const blocks = await call(network, 'chain.get_blocks_by_number', [
    parseInt(top.toString(), 10),
    PAGE_SIZE,
  ])
  const uncles = flatMap(blocks, (block) => block.uncles)
  const transactions = await Promise.all(
    flatMap(blocks, (block) =>
      block.body.Hashes.map((transaction) => call(network, 'chain.get_transaction', [transaction])),
    ),
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
  await Promise.all([
    transactionOperations.length
      ? collections[network].transactions.bulkWrite(transactionOperations)
      : undefined,
    uncleOperations.length ? collections[network].uncles.bulkWrite(uncleOperations) : undefined,
  ])
  if (blockOperations.length) {
    await collections[network].blocks.bulkWrite(blockOperations)
  }
}

/**
 * start a maintenance job
 */
export async function maintenance(network: Network) {
  const info = await call(network, 'chain.info', [])
  try {
    await find(network, BigInt(info.head.number))
    return null
  } catch (err) {
    if (err instanceof AbortError) {
      await Promise.all(
        Array.from({ length: MAINTENANCE_SIZE }).map((_, index) =>
          load(network, BigInt(err.message) + BigInt(index * PAGE_SIZE)),
        ),
      )
      return BigInt(err.message)
    }
    throw err
  }
}
