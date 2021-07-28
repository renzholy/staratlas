import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Divider, Spinner, GridItem, Grid } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import TransactionListItem from 'components/transaction-list-item'
import { useTransactionsByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import flatMap from 'lodash/flatMap'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'

export default function Transactions() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const { data, setSize } = useTransactionsByHeight(info ? BigInt(info.head.number) : undefined, {
    revalidateOnFocus: false,
    revalidateAll: false,
  })
  const transactions = useMemo(() => flatMap(data, (datum) => datum), [data])
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
          {transactions?.length ? (
            transactions.map((transaction, index) => (
              <Fragment key={transaction._id}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction._id} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
