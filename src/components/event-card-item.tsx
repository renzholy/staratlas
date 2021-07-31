import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { Static } from '@sinclair/typebox'
import { onchain_events } from '@starcoin/starcoin'
import useNetwork from 'hooks/use-network'
import Link from 'next/link'
import { useMemo } from 'react'
import { TransactionEvent } from 'utils/json-rpc/chain'
import { textInCardStyle } from 'utils/style'
import JsonCode from './json-code'

type EventName =
  | 'AcceptTokenEvent'
  | 'BlockRewardEvent'
  | 'BurnEvent'
  | 'MintEvent'
  | 'DepositEvent'
  | 'WithdrawEvent'
  | 'NewBlockEvent'
  | 'VoteChangedEvent'
  | 'ProposalCreatedEvent'

type Type = {
  AcceptTokenEvent: unknown
  BlockRewardEvent: {
    block_number: string
    block_reward: string
    gas_fees: string
    miner: string
  }
  BurnEvent: unknown
  MintEvent: unknown
  DepositEvent: {
    amount: string
    metadata: unknown[]
    token_code: {
      address: string
      module: string
      name: string
    }
  }
  WithdrawEvent: string
  NewBlockEvent: {
    number: string
    author: string
    timestamp: string
    uncles: string
  }
  VoteChangedEvent: string
  ProposalCreatedEvent: string
}

function decodeEventData(eventName: string, eventData: string) {
  try {
    return onchain_events.decodeEventData(eventName, eventData).toJS()
  } catch {
    return eventData
  }
}

export default function EventCardItem(props: {
  event: Static<typeof TransactionEvent>
  showHash?: boolean
}) {
  const network = useNetwork()
  const event = useMemo<{
    key: { address: string; salt: bigint }
    module: string
    name: EventName
    data: Type[EventName]
    seq: string
  }>(() => {
    const [, module, name] = props.event.type_tag.split('::')
    const key = onchain_events.decodeEventKey(props.event.event_key) as {
      address: string
      salt: bigint
    }
    const data = decodeEventData(name, props.event.data)
    return {
      key,
      module,
      name: name as EventName,
      data,
      seq: props.event.event_seq_number,
    }
  }, [props.event])

  return (
    <Box paddingX={6} paddingY={4} width="100%" css={textInCardStyle}>
      <Heading size="sm">
        {event.module}::{event.name}
      </Heading>
      <Text color="gray.500">{props.event.event_key}</Text>
      {props.showHash ? (
        <>
          <Heading size="sm" mt={4}>
            Block
          </Heading>
          <Link href={`/${network}/block/${props.event.block_hash}`} passHref={true}>
            <Button as="a" variant="link" color="blue.500">
              {props.event.block_hash}
            </Button>
          </Link>
          <Heading size="sm" mt={4}>
            Transaction
          </Heading>
          <Link href={`/${network}/tx/${props.event.transaction_hash}`} passHref={true}>
            <Button as="a" variant="link" color="orange.500">
              {props.event.transaction_hash}
            </Button>
          </Link>
        </>
      ) : null}
      <JsonCode>{event.data}</JsonCode>
    </Box>
  )
}
