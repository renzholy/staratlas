/* eslint-disable no-console */

import { Static } from '@sinclair/typebox'
import sumBy from 'lodash/sumBy'
import last from 'lodash/last'
import flatten from 'lodash/flatten'
import { atlasDatabase } from 'utils/database'
import { call } from 'utils/json-rpc'
import { BlockSimple } from 'utils/json-rpc/chain'
import { Network } from 'utils/types'
import { INDEX_SIZE } from 'utils/constants'

const MAX_BATCH_SIZE = 16

const BLOCK_PAGE_SIZE = 32

function mapper(block: Static<typeof BlockSimple>) {
  return {
    height: parseInt(block.header.number, 10),
    block: block.header.block_hash,
    transactions: block.body.Hashes,
    uncles: block.uncles.map((uncle) => uncle.block_hash),
  }
}

async function run(network: Network, start: number, end = 0) {
  let uncles = 0
  let transactions = 0
  let batchSize = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const blocks = flatten(
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        Array.from({ length: batchSize }).map((_, index) =>
          start - index * BLOCK_PAGE_SIZE >= 0
            ? call(network, 'chain.get_blocks_by_number', [
                start - index * BLOCK_PAGE_SIZE,
                BLOCK_PAGE_SIZE,
              ])
            : [],
        ),
      ),
    )
    // eslint-disable-next-line no-await-in-loop
    await atlasDatabase[network].bulkPut(blocks.map(mapper))
    // eslint-disable-next-line no-param-reassign
    start = parseInt(last(blocks)!.header.number, 10) - 1
    uncles += sumBy(blocks, (block) => block.uncles.length)
    transactions += sumBy(blocks, (block) => block.body.Hashes.length)
    batchSize = Math.min(batchSize + 2, MAX_BATCH_SIZE)
    if (
      (transactions >= INDEX_SIZE[network] && uncles >= INDEX_SIZE[network]) ||
      blocks.length === 0 ||
      start <= end
    ) {
      return
    }
  }
}

let prevNetwork: Network

let isRunning: boolean

globalThis.addEventListener('message', async (e) => {
  const network = e.data as Network
  if (network === prevNetwork && isRunning) {
    return
  }
  prevNetwork = network
  isRunning = true
  const firstIndex = await atlasDatabase[network].orderBy('height').first()
  const lastIndex = await atlasDatabase[network].orderBy('height').last()
  const info = await call(network, 'chain.info', [])
  const currentHeight = parseInt(info.head.number, 10)
  if (!firstIndex || !lastIndex) {
    // init
    console.log('init run', network, currentHeight)
    await run(network, currentHeight)
    isRunning = false
    return
  }
  const blocks = await atlasDatabase[network].count()
  if (
    lastIndex.height - firstIndex.height === blocks - 1 &&
    currentHeight - lastIndex.height <= BLOCK_PAGE_SIZE * MAX_BATCH_SIZE * 64 // about 64 times batch call
  ) {
    const transactions = sumBy(
      await atlasDatabase[network].filter((x) => x.transactions.length > 0).toArray(),
      (x) => x.transactions.length,
    )
    const uncles = sumBy(
      await atlasDatabase[network].filter((x) => x.uncles.length > 0).toArray(),
      (x) => x.uncles.length,
    )
    if (transactions >= INDEX_SIZE[network] && uncles >= INDEX_SIZE[network]) {
      console.log('increment run', network, currentHeight, lastIndex.height)
      // index has no hole and index is not too old
      await run(network, currentHeight, lastIndex.height)
    } else {
      console.log('init run2', network, currentHeight)
      await run(network, currentHeight)
    }
  } else {
    console.log('clear run', network, currentHeight)
    // index has hole or index is too old
    await atlasDatabase[network].clear()
    await run(network, currentHeight)
  }
  isRunning = false
})
