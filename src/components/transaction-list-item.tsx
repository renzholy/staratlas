import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding, types } from '@starcoin/starcoin'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TimeAgo from 'timeago-react'

import { useNetwork } from '../contexts/network'
import { useBlock, useEventsOfTransaction, useTransactionInfo } from '../hooks/use-provider'
import { formatTimeSimple, formatNumber } from '../utils/formatter'

export default function TransactionListItem(props: {
  transaction: types.SignedUserTransactionView
  relativeTime?: boolean
}) {
  const network = useNetwork()
  const { transaction } = props
  const payload = useMemo(
    () => encoding.decodeTransactionPayload(transaction.raw_txn.payload),
    [transaction],
  )
  const { data: info } = useTransactionInfo(transaction.transaction_hash)
  const { data: block } = useBlock(info?.block_hash)
  const { data: events } = useEventsOfTransaction(transaction.transaction_hash)
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
      {block ? (
        <Text
          css={css`
            float: right;
          `}
        >
          {props.relativeTime ? (
            <TimeAgo datetime={block.header.timestamp.toString()} />
          ) : (
            formatTimeSimple(parseInt(block.header.timestamp.toString(), 10))
          )}
        </Text>
      ) : null}
      Sender:&nbsp;
      <Button
        as={Link}
        to={`/${network}/address/${transaction.raw_txn.sender}`}
        variant="link"
        color="green.500"
        width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (44px * 4) - 130px)' }}
      >
        {transaction.raw_txn.sender}
      </Button>
      <br />
      <Text minWidth={44}>{payload ? Object.keys(payload)[0] : 'No payload'}</Text>
      <Text minWidth={32} color={status === 'Executed' ? undefined : 'red.500'}>
        {status}
      </Text>
      <Text minWidth={32}>Events:&nbsp;{events ? formatNumber(events.length) : '-'}</Text>
      <Text>Gas:&nbsp;{info ? formatNumber(info.gas_used as bigint) : '-'}</Text>
    </Box>
  )
}
