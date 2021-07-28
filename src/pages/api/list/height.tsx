/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import flatMap from 'lodash/flatMap'
import first from 'lodash/first'
import last from 'lodash/last'
import { Decimal128, Binary } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { call } from 'utils/json-rpc'
import { Network } from 'utils/types'
import { arrayify } from 'ethers/lib/utils'
import { mapper, Type } from 'utils/api'

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
        .sort({ height: -1, _id: 1 })
        .limit(LIMIT)
        .toArray()
    }
    case 'uncle': {
      return collections[network].uncles
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1, _id: 1 })
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

export default async function ListByHeight(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { type, network, ...query } = req.query as { network: Network; type: Type; height: string }
  const height = BigInt(query.height)

  let cursor = height
  while (cursor > 0) {
    const data = await list(network, type, height)
    if (
      data.length >= LIMIT &&
      (type !== 'block' ||
        (BigInt(first(data as { height: Decimal128 }[])!.height.toString()) === height &&
          height - BigInt(last(data as { height: Decimal128 }[])!.height.toString()) ===
            BigInt(data.length - 1)))
    ) {
      res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
      res.json(data.map(mapper))
      return
    }
    await load(network, cursor)
    cursor -= BigInt(PAGE_SIZE)
  }

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json((await list(network, type, height)).map(mapper))
}
