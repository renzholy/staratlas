import { MongoClient } from 'mongodb'
import { Network } from 'utils/types'
import { Decimal128 } from 'bson'

const client = await new MongoClient(process.env.MONGO_URL!, {
  readPreference: 'secondaryPreferred',
}).connect()

console.log('mongo connected')

const db = client.db()

async function prepare(network: Network) {
  const blocks = db.collection<{ hash: Buffer; height: Decimal128; author: Buffer }>(
    `${network}.blocks`,
  )
  await blocks.createIndex({ hash: 1 }, { background: true, unique: true })
  await blocks.createIndex({ height: -1 }, { background: true, unique: true })
  await blocks.createIndex({ author: 1 }, { background: true })

  const transactions = db.collection<{ hash: Buffer; height: Decimal128; sender?: Buffer }>(
    `${network}.transactions`,
  )
  await transactions.createIndex({ hash: 1 }, { background: true, unique: true })
  await transactions.createIndex({ height: -1 }, { background: true })
  await transactions.createIndex({ sender: 1 }, { background: true, sparse: true })

  const uncles = db.collection<{ hash: Buffer; height: Decimal128; author: Buffer }>(
    `${network}.uncles`,
  )
  await uncles.createIndex({ hash: 1 }, { background: true, unique: true })
  await uncles.createIndex({ height: -1 }, { background: true })
  await uncles.createIndex({ author: 1 }, { background: true })

  return { blocks, transactions, uncles }
}

export const collections = {
  main: await prepare('main'),
  proxima: await prepare('proxima'),
  barnard: await prepare('barnard'),
  halley: await prepare('halley'),
}
