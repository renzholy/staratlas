import { Grid, GridItem, Button, Divider, Spinner, useColorModeValue } from '@chakra-ui/react'
import Link from 'next/link'
import { AnimateSharedLayout, motion } from 'framer-motion'

import useNetwork from 'hooks/use-network'
import { useBlockList } from 'hooks/use-block-api'
import { useTransactionList } from 'hooks/use-transaction-api'
import { formatNumber } from 'utils/formatter'
import TransactionListItem from 'components/transaction-list-item'
import BlockListItem from 'components/block-list-item'
import EpochStat from 'components/epoch-stat'
import { CardWithHeader } from 'layouts/card-with-header'
import ListItemPlaceholder from 'components/list-item-placeholder'

const SIZE = 20

export default function Index() {
  const network = useNetwork()
  const { data: blocks } = useBlockList(1, { refreshInterval: 2000 })
  const { data: transactions } = useTransactionList(1, { refreshInterval: 2000 })
  const buttonBackground = useColorModeValue('white', undefined)

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <EpochStat blocks={blocks?.contents} />
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Latest blocks"
          subtitle={
            <Link href={`/${network}/blocks`} passHref={true}>
              <Button as="a" size="sm" bg={buttonBackground} mr={-4}>
                View all {blocks ? formatNumber(blocks.total) : '-'}
              </Button>
            </Link>
          }
        >
          <AnimateSharedLayout>
            {blocks?.contents.length ? (
              blocks.contents.map((block, index) => (
                <motion.div layout={true} key={block.header.block_hash}>
                  {index === 0 ? null : <Divider />}
                  <BlockListItem block={block} relativeTime={true} />
                </motion.div>
              ))
            ) : (
              <ListItemPlaceholder height={SIZE * 68 - 1}>
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
                View all {transactions ? formatNumber(transactions.total) : '-'}
              </Button>
            </Link>
          }
        >
          <AnimateSharedLayout>
            {transactions?.contents.length ? (
              transactions.contents.map((transaction, index) => (
                <motion.div layout={true} key={transaction.transaction_hash}>
                  {index === 0 ? null : <Divider />}
                  <TransactionListItem transaction={transaction} relativeTime={true} />
                </motion.div>
              ))
            ) : (
              <ListItemPlaceholder height={SIZE * 68 - 1}>
                <Spinner />
              </ListItemPlaceholder>
            )}
          </AnimateSharedLayout>
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
