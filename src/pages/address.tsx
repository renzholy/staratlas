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
  Text,
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
import { numberFormat } from '../utils/formatter'

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
      <GridItem colSpan={1} />
      <GridItem colSpan={1}>
        <CardWithHeader title="Balances">
          {balances ? (
            <Box paddingX={6} paddingY={4}>
              {Object.entries(balances).map(([key, value], index) => (
                <Fragment key={key}>
                  <Heading size="sm" mt={index === 0 ? 0 : 4}>
                    {key}
                  </Heading>
                  <Text color="gray.500">{numberFormat.format(value as bigint)}</Text>
                </Fragment>
              ))}
            </Box>
          ) : (
            <ListItemPlaceholder height={67}>
              {balances && Object.entries(balances).length === 0 ? 'No balances' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer height={6} />
        <CardWithHeader title="Resource">
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
            <ListItemPlaceholder height={67}>
              {resources && Object.entries(resources).length === 0 ? 'No resource' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Transactions"
          subtitle={<Text>Total:&nbsp;{numberFormat.format(transactions?.total || 0)}</Text>}
        >
          {transactions?.contents ? (
            transactions.contents.map((transaction, index) => (
              <Fragment key={transaction.transaction_hash}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {transactions?.contents?.length === 0 ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
