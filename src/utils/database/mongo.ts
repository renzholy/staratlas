import { MongoClient } from 'mongodb'

const client = await new MongoClient(process.env.MONGO_URL!, {
  readPreference: 'secondaryPreferred',
}).connect()

const db = client.db()

const blocks = db.collection<{ hash: Buffer; height: BigInt; author: Buffer }>('blocks')
await blocks.createIndex({ hash: 1 }, { background: true, unique: true })
await blocks.createIndex({ height: 1 }, { background: true, unique: true })
await blocks.createIndex({ author: 1 }, { background: true })

const transactions = db.collection<{ hash: Buffer; height: BigInt; sender: Buffer }>('transactions')
await transactions.createIndex({ hash: 1 }, { background: true, unique: true })
await transactions.createIndex({ height: 1 }, { background: true })
await transactions.createIndex({ sender: 1 }, { background: true })

const uncles = db.collection<{ hash: Buffer; height: BigInt; author: Buffer }>('uncles')
await uncles.createIndex({ hash: 1 }, { background: true, unique: true })
await uncles.createIndex({ height: 1 }, { background: true })
await uncles.createIndex({ author: 1 }, { background: true })

export const collections = {
  blocks,
  transactions,
  uncles,
}
