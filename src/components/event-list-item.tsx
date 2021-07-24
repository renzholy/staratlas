import { Box, Heading, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { onchain_events } from '@starcoin/starcoin'
import { useMemo } from 'react'

import { numberFormat } from '../utils/formatter'
import { Event } from '../utils/types'
import CopyLink from './copy-link'
import JsonCode from './json-code'

function decodeEventData(eventName: string, eventData: string) {
  try {
    return onchain_events.decodeEventData(eventName, eventData).toJS()
  } catch {
    return eventData
  }
}

export default function EventListItem(props: { event: Event }) {
  const event = useMemo(() => {
    const [, module, name] = props.event.type_tag.split('::')
    const key = onchain_events.decodeEventKey(props.event.event_key)
    const data = decodeEventData(name, props.event.data)
    return {
      key,
      name,
      module,
      data,
      seq: props.event.event_seq_number,
    }
  }, [props.event])

  return (
    <Box
      paddingX={6}
      paddingY={4}
      width="100%"
      css={css`
        button,
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
      <Heading size="sm">Tag</Heading>
      <CopyLink>{props.event.type_tag}</CopyLink>
      <Heading size="sm" mt={4}>
        Key
      </Heading>
      <CopyLink>{props.event.event_key}</CopyLink>
      <Heading size="sm" mt={4}>
        Seq
      </Heading>
      <Text color="gray.500">{numberFormat.format(props.event.event_seq_number as number)}</Text>
      <Heading size="sm" mt={4}>
        Data
      </Heading>
      <JsonCode>{event.data}</JsonCode>
    </Box>
  )
}
