import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding } from '@starcoin/starcoin'
import copy from 'copy-to-clipboard'
import { Fragment, lazy, Suspense, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CopyLink from 'components/copy-link'
import EventListItem from 'components/event-list-item'
import JsonCode from 'components/json-code'
import ListItemPlaceholder from 'components/list-item-placeholder'
import NotFound from 'components/not-fount'
import TransactionPayload from 'components/transaction-payload'
import TransactionStat from 'components/transaction-stat'
import useNetwork from 'hooks/use-network'
import { useTransaction } from 'hooks/use-transaction-api'
import { CardWithHeader } from 'layouts/card-with-header'
import { formatNumber } from 'utils/formatter'

const DryRunModal = lazy(() => import('components/dry-run-modal'))

export default function Transaction() {
  const router = useRouter()
  const { hash } = router.query as { hash?: string }
  const network = useNetwork()
  const { data: transaction, error } = useTransaction(hash)
  const sender = useMemo(
    () =>
      transaction
        ? 'user_transaction' in transaction
          ? transaction.user_transaction.raw_txn.sender
          : transaction.block_metadata.author
        : undefined,
    [transaction],
  )
  const payload = useMemo(
    () =>
      transaction &&
      'user_transaction' in transaction &&
      transaction.user_transaction.raw_txn.payload
        ? encoding.decodeTransactionPayload(transaction.user_transaction.raw_txn.payload)
        : undefined,
    [transaction],
  )
  const toast = useToast()

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
        <CardWithHeader
          title="Transaction"
          subtitle={
            transaction && 'user_transaction' in transaction ? (
              <Suspense fallback={null}>
                <DryRunModal userTransaction={transaction.user_transaction} />
              </Suspense>
            ) : null
          }
        >
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
              <Link href={`/${network}/address/${sender}`} passHref={true}>
                <Button as="a" variant="link" color="green.500">
                  {sender}
                </Button>
              </Link>
              <Heading size="sm" mt={4}>
                Block
              </Heading>
              <Link href={`/${network}/block/${transaction.block_hash}`} passHref={true}>
                <Button as="a" variant="link" color="blue.500">
                  {transaction.block_hash}
                </Button>
              </Link>
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
            transaction && 'user_transaction' in transaction ? (
              <Button
                size="sm"
                mr={-4}
                onClick={() => {
                  copy(transaction.user_transaction.raw_txn.payload)
                  toast({
                    title: 'Copied to clipboard',
                    status: 'success',
                    duration: 1000,
                  })
                }}
              >
                Copy hex
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
              <Fragment key={event.event_key + event.event_seq_number}>
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
