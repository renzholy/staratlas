/* eslint-disable no-await-in-loop */

import { Decimal128 } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { Network } from 'utils/types'
import { mapper } from 'utils/api'
import { load, maintenance } from 'utils/database/maintenance'
import { RPC_BLOCK_LIMIT, API_PAGE_SIZE } from 'utils/constants'

async function list(network: Network, height: BigInt, strict: boolean = false) {
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

export default async function transactionsByHeight(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { network, ...query } = req.query as {
    network: Network
    height: string
    strict?: string
  }
  const height = BigInt(query.height)
  const strict = !!query.strict

  let cursor = height
  while (cursor > 0) {
    const data = await list(network, height, strict)
    if (strict || data.length >= API_PAGE_SIZE) {
      res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
      res.json(data.map(mapper))
      return
    }
    await load(network, cursor)
    cursor -= BigInt(RPC_BLOCK_LIMIT)
  }

  maintenance(network, height)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json((await list(network, height, strict)).map(mapper))
}
