import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { encoding } from '@starcoin/starcoin'
import copy from 'copy-to-clipboard'
import { Fragment, Suspense, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import EventCardItem from 'components/event-card-item'
import JsonCode from 'components/json-code'
import ListItemPlaceholder from 'components/list-item-placeholder'
import NotFound from 'components/not-fount'
import TransactionPayload from 'components/transaction-payload'
import TransactionStat from 'components/transaction-stat'
import useNetwork from 'hooks/use-network'
import { CardWithHeader } from 'layouts/card-with-header'
import dynamic from 'next/dynamic'
import useJsonRpc from 'hooks/use-json-rpc'
import { textInCardStyle } from 'utils/style'

const DryRunModal = dynamic(() => import('components/dry-run-modal'), { ssr: false })

export default function Transaction() {
  const router = useRouter()
  const { hash } = router.query as { hash?: string }
  const network = useNetwork()
  const { data: transaction, error } = useJsonRpc(
    'chain.get_transaction',
    hash ? [hash] : undefined,
    {
      revalidateOnFocus: false,
    },
  )
  const { data: events } = useJsonRpc('chain.get_events_by_txn_hash', hash ? [hash] : undefined)
  const { data: info } = useJsonRpc('chain.get_transaction_info', hash ? [hash] : undefined)
  const payload = useMemo(
    () =>
      transaction?.user_transaction
        ? encoding.decodeTransactionPayload(transaction.user_transaction.raw_txn.payload)
        : undefined,
    [transaction],
  )
  const buttonBackground = useColorModeValue('white', undefined)
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
      <TransactionStat payload={payload} info={info} />
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Transaction"
          subtitle={
            transaction?.user_transaction ? (
              <Suspense fallback={null}>
                <DryRunModal userTransaction={transaction.user_transaction} />
              </Suspense>
            ) : null
          }
        >
          {transaction ? (
            <Box paddingX={6} paddingY={4} css={textInCardStyle}>
              <Heading size="sm">Hash</Heading>
              <Text color="gray.500">{transaction.transaction_hash}</Text>
              {info && typeof info.status === 'object' ? (
                <>
                  <Heading size="sm" mt={4}>
                    Error
                  </Heading>
                  <JsonCode>{info.status}</JsonCode>
                </>
              ) : null}
              <Heading size="sm" mt={4}>
                Sender
              </Heading>
              {transaction.user_transaction ? (
                <Link
                  href={`/${network}/address/${transaction.user_transaction.raw_txn.sender}`}
                  passHref={true}
                >
                  <Button as="a" variant="link" color="green.500">
                    {transaction.user_transaction.raw_txn.sender}
                  </Button>
                </Link>
              ) : (
                <Text color="gray.500">none</Text>
              )}
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
              <Text color="gray.500">{info?.event_root_hash || ''}</Text>
              <Heading size="sm" mt={4}>
                State root hash
              </Heading>
              <Text color="gray.500">{info?.state_root_hash || ''}</Text>
            </Box>
          ) : (
            <ListItemPlaceholder height={311}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer height={6} />
        {!transaction || transaction.user_transaction ? (
          <CardWithHeader
            title="Payload"
            subtitle={
              transaction?.user_transaction ? (
                <Button
                  size="sm"
                  mr={-4}
                  bg={buttonBackground}
                  onClick={() => {
                    if (transaction?.user_transaction) {
                      copy(transaction.user_transaction.raw_txn.payload)
                      toast({
                        title: 'Copied to clipboard',
                        status: 'success',
                        duration: 1000,
                        isClosable: true,
                      })
                    }
                  }}
                >
                  Copy hex
                </Button>
              ) : null
            }
          >
            {payload ? (
              <Box paddingX={6} paddingY={4} css={textInCardStyle}>
                <TransactionPayload payload={payload} />
              </Box>
            ) : (
              <ListItemPlaceholder height={67}>
                {transaction ? 'No payload' : <Spinner />}
              </ListItemPlaceholder>
            )}
          </CardWithHeader>
        ) : null}
        {!transaction || transaction.block_metadata ? (
          <CardWithHeader title="Block metadata">
            <Box paddingX={6} paddingY={4} css={textInCardStyle}>
              <Heading size="sm">Author</Heading>
              <Link
                href={`/${network}/address/${transaction?.block_metadata.author}`}
                passHref={true}
              >
                <Button as="a" variant="link" color="green.500">
                  {transaction?.block_metadata.author}
                </Button>
              </Link>
              <Heading size="sm" mt={4}>
                Parent hash
              </Heading>
              <Link
                href={`/${network}/block/${transaction?.block_metadata.parent_hash}`}
                passHref={true}
              >
                <Button as="a" variant="link" color="blue.500">
                  {transaction?.block_metadata.parent_hash}
                </Button>
              </Link>
            </Box>
          </CardWithHeader>
        ) : null}
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader title="Events">
          {events?.length ? (
            events.map((event, index) => (
              <Fragment key={event.event_key + event.event_seq_number}>
                {index === 0 ? null : <Divider />}
                <EventCardItem event={event} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {events?.length === 0 ? 'No event' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
