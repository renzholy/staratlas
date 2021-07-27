/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */

import { Static } from '@sinclair/typebox'
import sumBy from 'lodash/sumBy'
import last from 'lodash/last'
import flatten from 'lodash/flatten'
import { AtlasDatabase } from 'utils/database'
import { call } from 'utils/json-rpc'
import { BlockSimple } from 'utils/json-rpc/chain'
import { Network } from 'utils/types'

const atlasDatabase = new AtlasDatabase()

const BATCH_SIZE = 10

const INIT_SIZE = 10

const BLOCK_PAGE_SIZE = 32

function mapper(block: Static<typeof BlockSimple>) {
  return {
    height: parseInt(block.header.number, 10),
    block: block.header.block_hash,
    transactions: block.body.Hashes,
    uncles: block.uncles.map((uncle) => uncle.block_hash),
  }
}

async function init(network: Network) {
  const info = await call(network, 'chain.info', [])
  let height = parseInt(info.head.number, 10)
  let uncles = 0
  let transactions = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const blocks = flatten(
      await Promise.all(
        Array.from({ length: BATCH_SIZE }).map((_, index) =>
          height - index * BLOCK_PAGE_SIZE >= 0
            ? call(network, 'chain.get_blocks_by_number', [
                height - index * BLOCK_PAGE_SIZE,
                BLOCK_PAGE_SIZE,
              ])
            : [],
        ),
      ),
    )
    await atlasDatabase[network].bulkPut(blocks.map(mapper))
    height = parseInt(last(blocks)!.header.number, 10) - 1
    uncles += sumBy(blocks, (block) => block.uncles.length)
    transactions += sumBy(blocks, (block) => block.body.Hashes.length)
    if (transactions >= INIT_SIZE && uncles >= INIT_SIZE) {
      return
    }
  }
}

globalThis.addEventListener('message', async (e) => {
  const network = e.data as 'main' | 'barnard' | 'halley' | 'proxima'
  const firstIndex = await atlasDatabase[network].orderBy('height').first()
  const lastIndex = await atlasDatabase[network].orderBy('height').last()
  if (!firstIndex || !lastIndex) {
    await init(network)
    return
  }
  const count = await atlasDatabase[network].count()
  if (lastIndex.height - firstIndex.height === count - 1) {
    // eslint-disable-next-line no-console
    console.log(firstIndex, lastIndex)
  }
})
