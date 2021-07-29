import { NextApiRequest, NextApiResponse } from 'next'
import { Network } from 'utils/types'
import { maintenance } from 'utils/database/maintenance'

export default async function Maintenance(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { network, height } = req.query as { network: Network; height?: string }

  const top = await maintenance(network, height ? BigInt(height) : undefined)

  res.json({
    top: top?.toString(),
  })
}
