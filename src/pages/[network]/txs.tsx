import { Fragment, useEffect, useRef } from 'react'
import { Divider, Spinner, GridItem, Grid } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import TransactionListItem from 'components/transaction-list-item'
import { useListByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useInfinite from 'hooks/use-infinite'

export default function Transactions() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const list = useListByHeight('transaction', info ? BigInt(info.head.number) : undefined, false, {
    revalidateOnFocus: false,
    revalidateAll: false,
  })
  const { data: transactions, setSize, isEmpty, isReachingEnd } = useInfinite(list)
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref, '-20px')
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize])

  return (
    <Grid
      templateColumns={{
        base: 'minmax(0, 1fr)',
        xl: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
      }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={{ base: 1, xl: 2 }} colStart={{ base: 1, xl: 2 }}>
        <CardWithHeader title="Transactions">
          {transactions?.map((transaction, index) => (
            <Fragment key={transaction._id}>
              {index === 0 ? null : <Divider />}
              <TransactionListItem transaction={transaction._id} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={67}>
              {isEmpty ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
