/* eslint-disable no-await-in-loop */

import flatMap from 'lodash/flatMap'
import { Decimal128 } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { call } from 'utils/json-rpc'
import { Network } from 'utils/types'

type Type = 'block' | 'transaction' | 'uncle'

const LIMIT = 10

const PAGE_SIZE = 32

async function list(network: Network, type: Type, height: BigInt) {
  console.log('list', network, type, height)
  switch (type) {
    case 'block': {
      return collections[network].blocks
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1 })
        .limit(LIMIT)
        .toArray()
    }
    case 'transaction': {
      return collections[network].transactions
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1 })
        .limit(LIMIT)
        .toArray()
    }
    case 'uncle': {
      return collections[network].uncles
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1 })
        .limit(LIMIT)
        .toArray()
    }
    default: {
      return []
    }
  }
}

async function load(network: Network, height: BigInt) {
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
        hash: Buffer.from(block.header.block_hash, 'hex'),
      },
      update: {
        $set: {
          height: new Decimal128(block.header.number),
          author: Buffer.from(block.header.author, 'hex'),
        },
      },
      upsert: true,
    },
  }))
  const transactionOperations = transactions.map((transaction) => ({
    updateOne: {
      filter: {
        hash: Buffer.from(transaction.transaction_hash, 'hex'),
      },
      update: {
        $set: {
          height: new Decimal128(transaction.block_number),
          sender: transaction.user_transaction
            ? Buffer.from(transaction.user_transaction?.raw_txn.sender, 'hex')
            : undefined,
        },
      },
      upsert: true,
    },
  }))
  const uncleOperations = uncles.map((uncle) => ({
    updateOne: {
      filter: {
        hash: Buffer.from(uncle.block_hash, 'hex'),
      },
      update: {
        $set: {
          height: new Decimal128(uncle.number),
          author: Buffer.from(uncle.author, 'hex'),
        },
      },
      upsert: true,
    },
  }))
  await Promise.all([
    blockOperations.length ? collections[network].blocks.bulkWrite(blockOperations) : undefined,
    transactionOperations.length
      ? collections[network].transactions.bulkWrite(transactionOperations)
      : undefined,
    uncleOperations.length ? collections[network].uncles.bulkWrite(uncleOperations) : undefined,
  ])
}

export default async function List(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { type, network, ...query } = req.query as { network: Network; type: Type; height: string }
  const height = BigInt(query.height)

  let cursor = height
  while (cursor > 0) {
    const data = await list(network, type, height)
    if (data.length >= LIMIT) {
      res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
      res.json({
        data,
      })
      return
    }
    await load(network, cursor)
    cursor -= BigInt(PAGE_SIZE)
  }

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json({
    data: await list(network, type, height),
  })
}
