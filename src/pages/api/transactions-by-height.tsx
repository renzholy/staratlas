/* eslint-disable no-await-in-loop */

import { Decimal128 } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { Network } from 'utils/types'
import { mapper } from 'utils/api'
import { maintenance } from 'utils/database/maintenance'
import { API_PAGE_SIZE } from 'utils/constants'
import { withSentry } from '@sentry/nextjs'

async function TransactionsByHeight(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { network, ...query } = req.query as {
    network: Network
    height: string
  }
  const height = BigInt(query.height)

  const data = await collections[network].transactions
    .find({
      height: { $lte: new Decimal128(height.toString()) },
    })
    .sort({ height: -1, _id: 1 })
    .limit(API_PAGE_SIZE)
    .toArray()

  // eslint-disable-next-line no-console
  maintenance(network, height).catch(console.error)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json(data.map(mapper))
}

export default withSentry(TransactionsByHeight)
