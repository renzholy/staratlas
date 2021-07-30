import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding } from '@starcoin/starcoin'
import { useMemo } from 'react'
import Link from 'next/link'
import TimeAgo from 'timeago-react'
import useNetwork from 'hooks/use-network'
import { formatTimeSimple, formatNumber } from 'utils/formatter'
import useJsonRpc from 'hooks/use-json-rpc'

export default function TransactionListItem(props: {
  transaction: string
  relativeTime?: boolean
}) {
  const network = useNetwork()
  const { data: transaction } = useJsonRpc('chain.get_transaction', [props.transaction])
  const { data: info } = useJsonRpc('chain.get_transaction_info', [props.transaction])
  const { data: events } = useJsonRpc('chain.get_events_by_txn_hash', [props.transaction])
  const { data: block } = useJsonRpc(
    'chain.get_block_by_hash',
    transaction ? [transaction.block_hash] : undefined,
  )
  const payload = useMemo(
    () =>
      transaction?.user_transaction
        ? encoding.decodeTransactionPayload(transaction.user_transaction.raw_txn.payload)
        : undefined,
    [transaction],
  )
  const status = useMemo(
    () =>
      info
        ? typeof info.status === 'string'
          ? info.status
          : Object.keys(info.status)[0]
        : undefined,
    [info],
  )

  return (
    <Box
      paddingX={6}
      paddingY={2}
      textColor="gray.500"
      width="100%"
      css={css`
        a,
        p {
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
      <Link href={`/${network}/tx/${transaction?.transaction_hash}`} passHref={true}>
        <Button
          as="a"
          variant="link"
          color="orange.500"
          width={{ base: undefined, md: 32 }}
          marginRight={{ base: undefined, md: 12 }}
        >
          {transaction?.transaction_hash}
        </Button>
      </Link>
      <Text
        css={css`
          float: right;
        `}
      >
        {block?.header ? (
          props.relativeTime ? (
            <TimeAgo datetime={block.header.timestamp} />
          ) : (
            formatTimeSimple(parseInt(block.header.timestamp, 10))
          )
        ) : (
          '-'
        )}
      </Text>
      Sender:&nbsp;
      {transaction?.user_transaction?.raw_txn.sender ? (
        <Link
          href={`/${network}/address/${transaction.user_transaction.raw_txn.sender}`}
          passHref={true}
        >
          <Button
            as="a"
            variant="link"
            color="green.500"
            maxWidth={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (44px * 4) - 140px)' }}
          >
            {transaction.user_transaction.raw_txn.sender}
          </Button>
        </Link>
      ) : (
        'none'
      )}
      <br />
      <Text minWidth={44}>{payload ? Object.keys(payload)[0] : 'No payload'}</Text>
      <Text minWidth={32} color={status === 'Executed' ? undefined : 'red.500'}>
        {status}
      </Text>
      <Text minWidth={32}>Events:&nbsp;{events ? formatNumber(events.length) : '-'}</Text>
      <Text>Gas:&nbsp;{info ? formatNumber(BigInt(info.gas_used)) : '-'}</Text>
    </Box>
  )
}
