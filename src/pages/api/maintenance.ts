import { NextApiRequest, NextApiResponse } from 'next'
import { Network } from 'utils/types'
import { maintenance } from 'utils/database/maintenance'
import { call } from 'utils/json-rpc'

export default async function Maintenance(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { network } = req.query as { network: Network }

  const info = await call(network, 'chain.info', [])

  try {
    await maintenance(network, BigInt(info.head.number))
    res.json({
      height: info.head.number,
    })
  } catch (err) {
    res.json({
      height: err.message,
    })
  }
}
