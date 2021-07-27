import Dexie from 'dexie'

export type Index = {
  height: number
  block: string
  transactions: string[]
  uncles: string[]
}

class AtlasDatabase extends Dexie {
  main: Dexie.Table<Index, number>

  barnard: Dexie.Table<Index, number>

  halley: Dexie.Table<Index, number>

  proxima: Dexie.Table<Index, number>

  constructor() {
    super('AtlasDatabase')
    this.version(1).stores({
      main: 'height, &block, *transactions, *uncles',
      barnard: 'height, &block, *transactions, *uncles',
      halley: 'height, &block, *transactions, *uncles',
      proxima: 'height, &block, *transactions, *uncles',
    })
    this.main = this.table('main')
    this.barnard = this.table('barnard')
    this.halley = this.table('halley')
    this.proxima = this.table('proxima')
  }
}

export const atlasDatabase = new AtlasDatabase()
