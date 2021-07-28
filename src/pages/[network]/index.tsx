import { Grid, GridItem, Button, Divider, Spinner, useColorModeValue } from '@chakra-ui/react'
import Link from 'next/link'
import { AnimateSharedLayout, motion } from 'framer-motion'
import useNetwork from 'hooks/use-network'
import TransactionListItem2 from 'components/transaction-list-item2'
import BlockListItem2 from 'components/block-list-item2'
import EpochStat from 'components/epoch-stat'
import { CardWithHeader } from 'layouts/card-with-header'
import ListItemPlaceholder from 'components/list-item-placeholder'
import { INDEX_SIZE } from 'utils/constants'
import { useBlocksByHeight, useTransactionsByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'

export default function Index() {
  const network = useNetwork()
  const { data: info } = useJsonRpc('chain.info', [], { refreshInterval: 2000 })
  const { data: blocks } = useBlocksByHeight(info ? BigInt(info.head.number) : undefined)
  const { data: transactions } = useTransactionsByHeight(
    info ? BigInt(info.head.number) : undefined,
  )
  const buttonBackground = useColorModeValue('white', undefined)

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
                <motion.div layout={true} key={block._id}>
                  {index === 0 ? null : <Divider />}
                  <BlockListItem2 block={block._id} relativeTime={true} />
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
                <motion.div layout={true} key={transaction._id}>
                  {index === 0 ? null : <Divider />}
                  <TransactionListItem2 transaction={transaction._id} relativeTime={true} />
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
