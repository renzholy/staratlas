import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Divider, Spinner, Center, Box } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import TransactionListItem from 'components/transaction-list-item'
import { useTransactionsByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import flatMap from 'lodash/flatMap'
import useOnScreen from 'hooks/use-on-screen'

export default function Transactions() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const { data, setSize } = useTransactionsByHeight(info ? BigInt(info.head.number) : undefined, {
    revalidateOnFocus: false,
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
    <Center gap={6} padding={6} width="100%">
      <Box maxWidth="xl">
        {transactions?.length ? (
          <CardWithHeader title="Transactions">
            {transactions.map((transaction, index) => (
              <Fragment key={transaction._id}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction._id} />
              </Fragment>
            ))}
          </CardWithHeader>
        ) : (
          <Spinner />
        )}
        <div ref={ref} />
      </Box>
    </Center>
  )
}
