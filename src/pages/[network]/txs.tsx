import { Fragment, useState, useEffect } from 'react'
import {
  Divider,
  Grid,
  GridItem,
  Spinner,
  ButtonGroup,
  IconButton,
  useColorMode,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import ListItemPlaceholder from 'components/list-item-placeholder'
import { CardWithHeader } from 'layouts/card-with-header'
import TransactionListItem from 'components/transaction-list-item'
import { useTransactionsByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'

const SIZE = 10

export default function Transactions() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const [transactionHeight, setTransactionHeight] = useState<bigint | undefined>()
  const { data: transactions } = useTransactionsByHeight(transactionHeight, {
    revalidateOnFocus: false,
  })
  useEffect(() => {
    setTransactionHeight(info ? BigInt(info.head.number) : undefined)
  }, [info])
  const { colorMode } = useColorMode()

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Transactions"
          subtitle={
            <>
              <ButtonGroup
                size="sm"
                isAttached={true}
                variant={colorMode === 'light' ? 'outline' : undefined}
                spacing={0}
                mr={-4}
              >
                <IconButton
                  aria-label="prev transaction"
                  icon={<ChevronLeftIcon />}
                  mr="-px"
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setTransactionHeight((old) => (old ? old + BigInt(SIZE) : old))
                  }}
                  disabled={
                    !info || !transactionHeight || transactionHeight >= BigInt(info.head.number)
                  }
                />
                <IconButton
                  aria-label="next transaction"
                  icon={<ChevronRightIcon />}
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setTransactionHeight((old) => (old ? old - BigInt(SIZE) : old))
                  }}
                  disabled={!transactionHeight || transactionHeight - BigInt(SIZE) <= BigInt(0)}
                />
              </ButtonGroup>
            </>
          }
        >
          {transactions?.length ? (
            transactions.map((transaction, index) => (
              <Fragment key={transaction._id}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction._id} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={SIZE * 68 - 1}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
