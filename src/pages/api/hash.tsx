import { Binary } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { Network } from 'utils/types'
import { mapper, Type } from 'utils/api'
import { arrayify } from 'ethers/lib/utils'

async function get(network: Network, type: Type, hash: string) {
  switch (type) {
    case 'block': {
      return collections[network].blocks.findOne({ _id: new Binary(arrayify(hash)) })
    }
    case 'transaction': {
      return collections[network].transactions.findOne({ _id: new Binary(arrayify(hash)) })
    }
    case 'uncle': {
      return collections[network].uncles.findOne({ _id: new Binary(arrayify(hash)) })
    }
    default: {
      return undefined
    }
  }
}

export default async function getByAddress(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { type, network, hash } = req.query as { network: Network; type: Type; hash: string }

  const data = await get(network, type, hash)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json(data ? mapper(data) : null)
}
