/* eslint-disable no-await-in-loop */

import first from 'lodash/first'
import last from 'lodash/last'
import { Decimal128 } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { Network } from 'utils/types'
import { mapper, Type } from 'utils/api'
import { load, maintenance } from 'utils/database/maintenance'
import { RPC_BLOCK_LIMIT, API_PAGE_SIZE } from 'utils/constants'

async function list(network: Network, type: Type, height: BigInt, strict: boolean = false) {
  switch (type) {
    case 'block': {
      const cursor = collections[network].blocks
        .find({
          height: strict
            ? new Decimal128(height.toString())
            : { $lte: new Decimal128(height.toString()) },
        })
        .sort({ height: -1 })
      if (!strict) {
        cursor.limit(API_PAGE_SIZE)
      }
      return cursor.toArray()
    }
    case 'transaction': {
      const cursor = collections[network].transactions
        .find({
          height: strict
            ? new Decimal128(height.toString())
            : { $lte: new Decimal128(height.toString()) },
        })
        .sort({ height: -1, _id: 1 })
      if (!strict) {
        cursor.limit(API_PAGE_SIZE)
      }
      return cursor.toArray()
    }
    case 'uncle': {
      const cursor = collections[network].uncles
        .find({
          height: strict
            ? new Decimal128(height.toString())
            : { $lte: new Decimal128(height.toString()) },
        })
        .sort({ height: -1, _id: 1 })
      if (!strict) {
        cursor.limit(API_PAGE_SIZE)
      }
      return cursor.toArray()
    }
    default: {
      return []
    }
  }
}

export default async function listByHeight(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { type, network, ...query } = req.query as {
    network: Network
    type: Type
    height: string
    strict?: string
  }
  const height = BigInt(query.height)
  const strict = !!query.strict

  let cursor = height
  while (cursor > 0) {
    const data = await list(network, type, height, strict)
    if (
      strict ||
      (data.length >= API_PAGE_SIZE &&
        (type !== 'block' ||
          (BigInt(first(data as { height: Decimal128 }[])!.height.toString()) === height &&
            height - BigInt(last(data as { height: Decimal128 }[])!.height.toString()) ===
              BigInt(data.length - 1))))
    ) {
      res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
      res.json(data.map(mapper))
      return
    }
    await load(network, cursor)
    cursor -= BigInt(RPC_BLOCK_LIMIT)
  }

  maintenance(network, height)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json((await list(network, type, height, strict)).map(mapper))
}
