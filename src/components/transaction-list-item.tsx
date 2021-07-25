import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding } from '@starcoin/starcoin'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TimeAgo from 'timeago-react'

import { useNetwork } from '../contexts/network'
import { formatTimeSimple, formatNumber } from '../utils/formatter'
import { Transaction } from '../utils/types'

export default function TransactionListItem(props: {
  transaction: Transaction
  relativeTime?: boolean
}) {
  const network = useNetwork()
  const { transaction } = props
  const payload = useMemo(
    () =>
      'user_transaction' in transaction
        ? encoding.decodeTransactionPayload(transaction.user_transaction.raw_txn.payload)
        : undefined,
    [transaction],
  )
  const sender = useMemo(
    () =>
      'user_transaction' in transaction
        ? transaction.user_transaction.raw_txn.sender
        : transaction.block_metadata.author,
    [transaction],
  )
  const status = useMemo(
    () =>
      typeof transaction.status === 'string'
        ? transaction.status
        : Object.keys(transaction.status)[0],
    [transaction.status],
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
      <Button
        as={Link}
        to={`/${network}/tx/${transaction.transaction_hash}`}
        variant="link"
        color="orange.500"
        width={{ base: undefined, md: 32 }}
        marginRight={{ base: undefined, md: 12 }}
      >
        {transaction.transaction_hash}
      </Button>
      <Text
        css={css`
          float: right;
        `}
      >
        {props.relativeTime ? (
          <TimeAgo datetime={transaction.timestamp.toString()} />
        ) : (
          formatTimeSimple(parseInt(transaction.timestamp.toString(), 10))
        )}
      </Text>
      Sender:&nbsp;
      <Button
        as={Link}
        to={`/${network}/address/${sender}`}
        variant="link"
        color="green.500"
        width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (44px * 4) - 130px)' }}
      >
        {sender}
      </Button>
      <br />
      <Text minWidth={44}>{payload ? Object.keys(payload)[0] : 'No payload'}</Text>
      <Text minWidth={32} color={status === 'Executed' ? undefined : 'red.500'}>
        {status}
      </Text>
      <Text minWidth={32}>Events:&nbsp;{formatNumber(transaction.events.length)}</Text>
      <Text>Gas:&nbsp;{formatNumber(transaction.gas_used as bigint)}</Text>
    </Box>
  )
}
