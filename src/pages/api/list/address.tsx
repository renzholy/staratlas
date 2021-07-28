import { Binary } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from 'utils/database/mongo'
import { Network } from 'utils/types'
import { mapper, Type } from 'utils/api'
import { arrayify } from 'ethers/lib/utils'
import { maintenance } from 'utils/database/maintenance'

async function list(network: Network, type: Type, address: string) {
  switch (type) {
    case 'block': {
      return collections[network].blocks
        .find({ author: new Binary(arrayify(address)) })
        .sort({ height: -1 })
        .toArray()
    }
    case 'transaction': {
      return collections[network].transactions
        .find({ sender: new Binary(arrayify(address)) })
        .sort({ height: -1 })
        .toArray()
    }
    case 'uncle': {
      return collections[network].uncles
        .find({ author: new Binary(arrayify(address)) })
        .sort({ height: -1 })
        .toArray()
    }
    default: {
      return []
    }
  }
}

export default async function ListByAddress(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { type, network, address } = req.query as { network: Network; type: Type; address: string }

  const data = await list(network, type, address)

  maintenance(network)

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
  res.json(data.map(mapper))
}
