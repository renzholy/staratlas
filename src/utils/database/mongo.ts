import { MongoClient } from 'mongodb'
import { Network } from 'utils/types'
import { Long, Binary } from 'bson'

const client = await new MongoClient(process.env.MONGO_URL!, {
  readPreference: 'secondaryPreferred',
}).connect()

const db = client.db()

async function prepare(network: Network) {
  const blocks = db.collection<{
    _id: Binary
    height: Long
    author: Binary
  }>(`${network}.blocks`)
  await blocks.createIndex({ height: -1 }, { background: true, unique: true })
  await blocks.createIndex({ author: 1 }, { background: true })

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
  proxima: await prepare('proxima'),
  barnard: await prepare('barnard'),
  halley: await prepare('halley'),
}
