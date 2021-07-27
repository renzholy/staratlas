import Dexie from 'dexie'

export type Index = {
  height: number
  block: string
  transactions: string[]
  uncles: string[]
}

export class AtlasDatabase extends Dexie {
  index: Dexie.Table<Index, number>

  constructor() {
    super('AtlasDatabase')
    this.version(1).stores({
      index: 'height, &block, *transactions, *uncles',
    })
    this.index = this.table('index')
  }
}
