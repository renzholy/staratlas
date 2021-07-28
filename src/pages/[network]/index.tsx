import { useState, useEffect, useCallback } from 'react'
import {
  Grid,
  GridItem,
  Button,
  Divider,
  Spinner,
  useColorModeValue,
  useInterval,
} from '@chakra-ui/react'
import Link from 'next/link'
import { AnimateSharedLayout, motion } from 'framer-motion'
import useNetwork from 'hooks/use-network'
import TransactionListItem2 from 'components/transaction-list-item2'
import BlockListItem2 from 'components/block-list-item2'
import EpochStat from 'components/epoch-stat'
import { CardWithHeader } from 'layouts/card-with-header'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useSWR from 'swr'
import { atlasDatabase } from 'utils/database/dexie'
import flatten from 'lodash/flatten'
import take from 'lodash/take'
import { INDEX_SIZE } from 'utils/constants'

export default function Index() {
  const network = useNetwork()
  const { data: blocks } = useSWR(
    [network, 'database', 'blocks'],
    async () => {
      const data = await atlasDatabase[network]
        .orderBy('height')
        .reverse()
        .limit(INDEX_SIZE[network])
        .toArray()
      return data.map((datum) => datum.block)
    },
    { refreshInterval: 2000 },
  )
  const { data: transactions } = useSWR(
    [network, 'database', 'transactions'],
    async () => {
      const data = await atlasDatabase[network]
        .orderBy('height')
        .reverse()
        .filter((x) => x.transactions.length > 0)
        .limit(INDEX_SIZE[network])
        .toArray()
      return take(flatten(data.map((datum) => datum.transactions)), INDEX_SIZE[network])
    },
    { refreshInterval: 2000 },
  )
  const buttonBackground = useColorModeValue('white', undefined)
  const [worker, setWorker] = useState<Worker>()
  useEffect(() => {
    setWorker(new Worker(new URL('workers/maintain-index.worker', import.meta.url)))
  }, [network])
  const handlePostMessage = useCallback(() => {
    worker?.postMessage(network)
  }, [network, worker])
  useEffect(handlePostMessage, [handlePostMessage])
  useInterval(handlePostMessage, 2000)

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <EpochStat />
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Latest blocks"
          subtitle={
            <Link href={`/${network}/blocks`} passHref={true}>
              <Button as="a" size="sm" bg={buttonBackground} mr={-4}>
                View all
              </Button>
            </Link>
          }
        >
          <AnimateSharedLayout>
            {blocks?.length ? (
              blocks.map((block, index) => (
                <motion.div layout={true} key={block}>
                  {index === 0 ? null : <Divider />}
                  <BlockListItem2 block={block} relativeTime={true} />
                </motion.div>
              ))
            ) : (
              <ListItemPlaceholder height={INDEX_SIZE[network] * 68 - 1}>
                <Spinner />
              </ListItemPlaceholder>
            )}
          </AnimateSharedLayout>
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Latest transactions"
          subtitle={
            <Link href={`/${network}/txs`} passHref={true}>
              <Button as="a" size="sm" bg={buttonBackground} mr={-4}>
                View all
              </Button>
            </Link>
          }
        >
          <AnimateSharedLayout>
            {transactions?.length ? (
              transactions.map((transaction, index) => (
                <motion.div layout={true} key={transaction}>
                  {index === 0 ? null : <Divider />}
                  <TransactionListItem2 transaction={transaction} relativeTime={true} />
                </motion.div>
              ))
            ) : (
              <ListItemPlaceholder height={INDEX_SIZE[network] * 68 - 1}>
                <Spinner />
              </ListItemPlaceholder>
            )}
          </AnimateSharedLayout>
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
