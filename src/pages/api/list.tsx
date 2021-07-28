import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'

type Type = 'block' | 'transaction' | 'uncle'

async function listByType(type: Type, height: BigInt) {
  switch (type) {
    case 'block': {
      return collections.blocks.find({ height }).limit(10).toArray()
    }
    case 'transaction': {
      return collections.transactions.find({ height }).limit(10).toArray()
    }
    case 'uncle': {
      return collections.uncles.find({ height }).limit(10).toArray()
    }
    default: {
      return []
    }
  }
}

export default async function List(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { type, ...query } = req.query as { type: Type; height: string }
  const height = BigInt(query.height)

  const data = await listByType(type, height)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json({
    data,
  })
}
