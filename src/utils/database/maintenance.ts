import { call } from 'utils/json-rpc'
import { Network } from 'utils/types'
import flatMap from 'lodash/flatMap'
import { Decimal128, Binary } from 'bson'
import { arrayify } from 'ethers/lib/utils'
import { collections } from './mongo'

const PAGE_SIZE = 32

export async function maintenance(
  network: Network,
  top: bigint,
  bottom: bigint = BigInt(0),
  depth: number = 0,
) {
  console.log('maintenance', network, top, bottom, depth)
  if (top <= bottom) {
    return
  }
  const count = await collections[network].blocks.countDocuments({
    height: {
      $lte: new Decimal128(top.toString()),
      $gte: new Decimal128(bottom.toString()),
    },
  })
  if (top - bottom > count - 1) {
    if (top - bottom <= PAGE_SIZE - 1) {
      throw new Error(top.toString())
    }
    const mid = (top - bottom) / BigInt(2) + bottom
    if (Math.random() > 0.6) {
      await maintenance(network, top, mid, depth + 1)
    } else {
      await maintenance(network, mid, bottom, depth + 1)
    }
  }
}

export async function load(network: Network, height: BigInt) {
  console.log('load', network, height)
  const blocks = await call(network, 'chain.get_blocks_by_number', [
    parseInt(height.toString(), 10),
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
