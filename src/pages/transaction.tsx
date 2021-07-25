import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding } from '@starcoin/starcoin'
import { Fragment, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import CopyLink from '../components/copy-link'
import EventListItem from '../components/event-list-item'
import JsonCode from '../components/json-code'
import ListItemPlaceholder from '../components/list-item-placeholder'
import NotFound from '../components/not-fount'
import TransactionPayload from '../components/transaction-payload'
import TransactionStat from '../components/transaction-stat'
import { useNetwork } from '../contexts/network'
import useDryRunRaw from '../hooks/use-dry-run-raw'
import { useTransaction } from '../hooks/use-transaction-api'
import { CardWithHeader } from '../layouts/card-with-header'
import { formatNumber } from '../utils/formatter'

export default function Transaction() {
  const params = useParams<{ hash: string }>()
  const network = useNetwork()
  const { data: transaction, error } = useTransaction(params.hash)
  const sender = useMemo(
    () =>
      transaction
        ? 'user_transaction' in transaction
          ? transaction.user_transaction.raw_txn.sender
          : transaction.block_metadata.author
        : undefined,
    [transaction],
  )
  const senderPublicKey = useMemo(
    () =>
      transaction
        ? 'user_transaction' in transaction
          ? 'Ed25519' in transaction.user_transaction.authenticator
            ? transaction.user_transaction.authenticator.Ed25519.public_key
            : transaction.user_transaction.authenticator.MultiEd25519.public_key
          : transaction.block_metadata.author_auth_key
        : undefined,
    [transaction],
  )
  const buttonBackground = useColorModeValue('white', undefined)
  const payload = useMemo(
    () =>
      transaction &&
      'user_transaction' in transaction &&
      transaction.user_transaction.raw_txn.payload
        ? encoding.decodeTransactionPayload(transaction.user_transaction.raw_txn.payload)
        : undefined,
    [transaction],
  )
  const handleDryRunRaw = useDryRunRaw(
    senderPublicKey,
    transaction && 'user_transaction' in transaction
      ? transaction.user_transaction.raw_txn.payload
      : undefined,
  )

  if (error) {
    return <NotFound />
  }
  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <TransactionStat transaction={transaction} />
      <GridItem colSpan={1}>
        <CardWithHeader title="Transaction">
          {transaction && sender ? (
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
              <Heading size="sm">Hash</Heading>
              <CopyLink>{transaction.transaction_hash}</CopyLink>
              {typeof transaction.status === 'object' ? (
                <>
                  <Heading size="sm" mt={4}>
                    Error
                  </Heading>
                  <JsonCode>{transaction.status}</JsonCode>
                </>
              ) : null}
              <Heading size="sm" mt={4}>
                Sender
              </Heading>
              <Button
                as={Link}
                to={`/${network}/address/${sender}`}
                variant="link"
                color="green.500"
              >
                {sender}
              </Button>
              <Heading size="sm" mt={4}>
                Block
              </Heading>
              <Button
                as={Link}
                to={`/${network}/block/${transaction.block_hash}`}
                variant="link"
                color="blue.500"
              >
                {transaction.block_hash}
              </Button>
              <Heading size="sm" mt={4}>
                Event root hash
              </Heading>
              <CopyLink>{transaction.event_root_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                State root hash
              </Heading>
              <CopyLink>{transaction.state_root_hash}</CopyLink>
            </Box>
          ) : (
            <ListItemPlaceholder height={311}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer height={6} />
        <CardWithHeader
          title="Payload"
          subtitle={
            transaction &&
            'user_transaction' in transaction &&
            transaction.user_transaction.raw_txn.payload ? (
              <Button size="sm" mr={-4} bg={buttonBackground} onClick={handleDryRunRaw}>
                Dry run
              </Button>
            ) : null
          }
        >
          {payload ? (
            <Box
              paddingX={6}
              paddingY={4}
              css={css`
                button {
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
              <TransactionPayload payload={payload} />
            </Box>
          ) : (
            <ListItemPlaceholder height={67}>
              {transaction ? 'No payload' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Events"
          subtitle={`Total: ${transaction ? formatNumber(transaction.events.length) : '-'}`}
        >
          {transaction?.events.length ? (
            transaction.events.map((event, index) => (
              <Fragment key={event.event_key}>
                {index === 0 ? null : <Divider />}
                <EventListItem event={event} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {transaction?.events.length === 0 ? 'No event' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
