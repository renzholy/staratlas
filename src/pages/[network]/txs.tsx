import { Fragment, useState } from 'react'
import {
  Divider,
  Grid,
  GridItem,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Skeleton,
  ButtonGroup,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import ListItemPlaceholder from 'components/list-item-placeholder'
import { CardWithHeader } from 'layouts/card-with-header'
import { formatNumber } from 'utils/formatter'
import { usePendingTransactionList, useTransactionList } from 'hooks/use-transaction-api'
import TransactionListItem from 'components/transaction-list-item'

const SIZE = 20

export default function Transactions() {
  const [transactionPage, setTransactionPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const { data: transactions } = useTransactionList(transactionPage, { revalidateOnFocus: false })
  const { data: pendings } = usePendingTransactionList(pendingPage, { revalidateOnFocus: false })
  const { colorMode } = useColorMode()

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Transactions</StatLabel>
          <Skeleton isLoaded={!!transactions}>
            <StatNumber>{formatNumber(transactions?.total || 0)}</StatNumber>
          </Skeleton>
        </Stat>
      </GridItem>
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Pendings</StatLabel>
          <Skeleton isLoaded={!!pendings}>
            <StatNumber>{formatNumber(pendings?.total || 0)}</StatNumber>
          </Skeleton>
        </Stat>
      </GridItem>
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
                <Tooltip label={`page ${transactionPage - 1}`} placement="top">
                  <IconButton
                    aria-label="prev transaction"
                    icon={<ChevronLeftIcon />}
                    mr="-px"
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setTransactionPage((old) => old - 1)
                    }}
                    disabled={transactionPage === 1}
                  />
                </Tooltip>
                <Tooltip label={`page ${transactionPage + 1}`} placement="top">
                  <IconButton
                    aria-label="next transaction"
                    icon={<ChevronRightIcon />}
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setTransactionPage((old) => old + 1)
                    }}
                  />
                </Tooltip>
              </ButtonGroup>
            </>
          }
        >
          {transactions?.contents.length ? (
            transactions.contents.map((transaction, index) => (
              <Fragment key={transaction.transaction_hash}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={SIZE * 68 - 1}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Pendings"
          subtitle={
            <>
              <ButtonGroup
                size="sm"
                isAttached={true}
                variant={colorMode === 'light' ? 'outline' : undefined}
                spacing={0}
                mr={-4}
              >
                <Tooltip label={`page ${pendingPage - 1}`} placement="top">
                  <IconButton
                    aria-label="prev pending"
                    icon={<ChevronLeftIcon />}
                    mr="-px"
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setPendingPage((old) => old - 1)
                    }}
                    disabled={pendingPage === 1}
                  />
                </Tooltip>
                <Tooltip label={`page ${pendingPage + 1}`} placement="top">
                  <IconButton
                    aria-label="next pending"
                    icon={<ChevronRightIcon />}
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setPendingPage((old) => old + 1)
                    }}
                    disabled={pendings && pendings.total <= SIZE}
                  />
                </Tooltip>
              </ButtonGroup>
            </>
          }
        >
          {pendings?.contents.length ? (
            pendings.contents.map((pending, index) => (
              <Fragment key={pending.transaction_hash}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={pending} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={SIZE * 68 - 1}>
              {pendings?.contents.length === 0 ? 'No pendings' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
