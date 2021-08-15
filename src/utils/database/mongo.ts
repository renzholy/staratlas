import { MongoClient } from 'mongodb'
import type { Network } from 'utils/types'
import type { Long, Binary } from 'bson'

const client = await new MongoClient(process.env.MONGO_URL!, {
  readPreference: 'secondaryPreferred',
}).connect()

const db = client.db()

async function prepare(network: Network) {
  const blocks = db.collection<{
    _id: Binary
    height: Long
  }>(`${network}.blocks`)
  await blocks.createIndex({ height: -1 }, { background: true, unique: true })

  const transactions = db.collection<{
    _id: Binary
    height: Long
    sender?: Binary
  }>(`${network}.transactions`)
  await transactions.createIndex({ height: -1 }, { background: true })
  await transactions.createIndex({ sender: 1 }, { background: true, sparse: true })

  return { blocks, transactions }
}

export const collections = {
  main: await prepare('main'),
  barnard: await prepare('barnard'),
  proxima: await prepare('proxima'),
  halley: await prepare('halley'),
}
