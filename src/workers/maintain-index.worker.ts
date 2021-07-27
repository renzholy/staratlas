import { Static } from '@sinclair/typebox'
import sumBy from 'lodash/sumBy'
import last from 'lodash/last'
import flatten from 'lodash/flatten'
import { atlasDatabase } from 'utils/database'
import { call } from 'utils/json-rpc'
import { BlockSimple } from 'utils/json-rpc/chain'
import { Network } from 'utils/types'

const MAX_BATCH_SIZE = 16

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

async function run(network: Network, height: number, end = 0) {
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
          height - index * BLOCK_PAGE_SIZE >= 0
            ? call(network, 'chain.get_blocks_by_number', [
                height - index * BLOCK_PAGE_SIZE,
                BLOCK_PAGE_SIZE,
              ])
            : [],
        ),
      ),
    )
    // eslint-disable-next-line no-await-in-loop
    await atlasDatabase[network].bulkPut(blocks.map(mapper))
    // eslint-disable-next-line no-param-reassign
    height = parseInt(last(blocks)!.header.number, 10) - 1
    uncles += sumBy(blocks, (block) => block.uncles.length)
    transactions += sumBy(blocks, (block) => block.body.Hashes.length)
    batchSize = Math.min(batchSize + 2, MAX_BATCH_SIZE)
    if (
      (transactions >= INIT_SIZE && uncles >= INIT_SIZE) ||
      blocks.length === 0 ||
      height <= end
    ) {
      return
    }
  }
}

globalThis.addEventListener('message', async (e) => {
  const network = e.data as Network
  const firstIndex = await atlasDatabase[network].orderBy('height').first()
  const lastIndex = await atlasDatabase[network].orderBy('height').last()
  const info = await call(network, 'chain.info', [])
  const currentHeight = parseInt(info.head.number, 10)
  if (!firstIndex || !lastIndex) {
    // init
    await run(network, currentHeight)
    return
  }
  const count = await atlasDatabase[network].count()
  if (
    lastIndex.height - firstIndex.height === count - 1 &&
    currentHeight - lastIndex.height <= BLOCK_PAGE_SIZE * MAX_BATCH_SIZE * 64 // about 64 times batch call
  ) {
    // index has no hole and index is not too old
    await run(network, currentHeight, lastIndex.height)
  } else {
    // index has hole or index is too old
    await atlasDatabase[network].clear()
    await run(network, currentHeight)
  }
})
