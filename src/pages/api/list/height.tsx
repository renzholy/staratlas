/* eslint-disable no-console */
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

async function list(network: Network, type: Type, height: BigInt) {
  console.log('list', network, type, height)
  switch (type) {
    case 'block': {
      return collections[network].blocks
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1 })
        .limit(API_PAGE_SIZE)
        .toArray()
    }
    case 'transaction': {
      return collections[network].transactions
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1, _id: 1 })
        .limit(API_PAGE_SIZE)
        .toArray()
    }
    case 'uncle': {
      return collections[network].uncles
        .find({ height: { $lte: new Decimal128(height.toString()) } })
        .sort({ height: -1, _id: 1 })
        .limit(API_PAGE_SIZE)
        .toArray()
    }
    default: {
      return []
    }
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
      data.length >= API_PAGE_SIZE &&
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
    cursor -= BigInt(RPC_BLOCK_LIMIT)
  }

  maintenance(network, height)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json((await list(network, type, height)).map(mapper))
}
