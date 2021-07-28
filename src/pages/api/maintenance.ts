import { NextApiRequest, NextApiResponse } from 'next'
import { Network } from 'utils/types'
import { maintenance } from 'utils/database/maintenance'

export default async function Maintenance(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { network } = req.query as { network: Network }

  const height = await maintenance(network)

  res.json({
    height: height?.toString(),
  })
}
