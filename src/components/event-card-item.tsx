import { Box, Button, Heading, Text } from '@chakra-ui/react'
import type { Static } from '@sinclair/typebox'
import { onchain_events } from '@starcoin/starcoin'
import type {
  AcceptTokenEvent,
  BlockRewardEvent,
  BurnEvent,
  DepositEvent,
  MintEvent,
  NewBlockEvent,
  VoteChangedEvent,
  WithdrawEvent,
} from '@starcoin/starcoin/dist/src/types'
import useNetwork from 'hooks/use-network'
import Link from 'next/link'
import { useMemo } from 'react'
import type { TransactionEvent } from 'utils/json-rpc/chain'
import { textInCardStyle } from 'utils/style'
import JsonCode from './json-code'

type EventType = {
  AcceptTokenEvent: AcceptTokenEvent
  BlockRewardEvent: BlockRewardEvent
  BurnEvent: BurnEvent
  MintEvent: MintEvent
  DepositEvent: DepositEvent
  WithdrawEvent: WithdrawEvent
  NewBlockEvent: NewBlockEvent
  VoteChangedEvent: VoteChangedEvent
  ProposalCreatedEvent: string
}

type EventName = keyof EventType

function decodeEventData(eventName: EventName, eventData: string) {
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
    module: string
    name: EventName
    data: EventType[EventName]
    seq: string
  }>(() => {
    const [, module, name] = props.event.type_tag.split('::')
    const data = decodeEventData(name as EventName, props.event.data)
    return {
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
