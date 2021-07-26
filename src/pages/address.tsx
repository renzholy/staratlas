import {
  Box,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import ResourceListItem from '../components/resource-list-item'
import ListItemPlaceholder from '../components/list-item-placeholder'
import NotFound from '../components/not-fount'
import TransactionListItem from '../components/transaction-list-item'
import { useBalances, useResources } from '../hooks/use-provider'
import { useAddressTransactions } from '../hooks/use-transaction-api'
import { CardWithHeader } from '../layouts/card-with-header'
import { formatNumber } from '../utils/formatter'
import BalanceAmount from '../components/balance-amount'

export default function Address() {
  const params = useParams<{ hash: string }>()
  const { data: resources, error } = useResources(params.hash)
  const { data: transactions } = useAddressTransactions(params.hash)
  const { data: balances } = useBalances(params.hash)

  if (error) {
    return <NotFound />
  }
  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Address</StatLabel>
          <StatNumber>{params.hash.toLowerCase()}</StatNumber>
        </Stat>
      </GridItem>
      <GridItem colSpan={1} display={{ base: 'none', xl: 'block' }} />
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Balances"
          subtitle={`Total: ${balances ? formatNumber(Object.keys(balances).length) : '-'}`}
        >
          {balances ? (
            <Box paddingX={6} paddingY={4}>
              {Object.entries(balances).map(([key, value], index) => (
                <Fragment key={key}>
                  <Heading size="sm" mt={index === 0 ? 0 : 4}>
                    {key}
                  </Heading>
                  <BalanceAmount token={key} value={value} />
                </Fragment>
              ))}
            </Box>
          ) : (
            <ListItemPlaceholder height={75}>
              {balances && Object.entries(balances).length === 0 ? 'No balances' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer height={6} />
        <CardWithHeader
          title="Resources"
          subtitle={`Total: ${resources ? formatNumber(Object.keys(resources).length) : '-'}`}
        >
          {resources ? (
            <Box
              paddingX={6}
              paddingY={4}
              css={css`
                button,
                a {
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  max-width: 100%;
                  display: inline-block;
                  text-align: start;
                  vertical-align: text-bottom;
                  font-weight: normal;
                }
              `}
            >
              {Object.entries(resources).map(([key, value], index) => (
                <Fragment key={key}>
                  {index === 0 ? null : <Divider mt={3} />}
                  <Heading size="sm" mt={index === 0 ? 0 : 4}>
                    {key}
                  </Heading>
                  <ResourceListItem resource={value} />
                </Fragment>
              ))}
            </Box>
          ) : (
            <ListItemPlaceholder height={75}>
              {resources && Object.entries(resources).length === 0 ? 'No resource' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Transactions"
          subtitle={`Total: ${transactions ? formatNumber(transactions.total) : '-'}`}
        >
          {transactions?.contents ? (
            transactions.contents.map((transaction, index) => (
              <Fragment key={transaction.transaction_hash}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={75}>
              {transactions?.contents?.length === 0 ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
