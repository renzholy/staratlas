import { Box, Text } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Link } from 'react-router-dom'
import TimeAgo from 'timeago-react'

import { useNetwork } from '../contexts/network'
import { formatTimeSimple, numberFormat } from '../utils/formatter'
import { Block } from '../utils/types'

export default function BlockListItem(props: { block: Block; relativeTime?: boolean }) {
  const { block } = props
  const network = useNetwork()

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
      <Box width={32} display="inline-block">
        <Button
          as={Link}
          to={`/${network}/block/${block.header.number}`}
          variant="link"
          color="blue.500"
        >
          #{block.header.number}
        </Button>
      </Box>
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
      Author:&nbsp;
      <Button
        as={Link}
        to={`/${network}/address/${block.header.author}`}
        variant="link"
        color="green.500"
        width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (32px * 4) - 130px)' }}
      >
        {block.header.author}
      </Button>
      <br />
      <Text minWidth={32}>Txns:&nbsp;{numberFormat.format(block.body.Full.length)}</Text>
      <Text minWidth={32}>Uncles:&nbsp;{numberFormat.format(block.uncles.length)}</Text>
      <Text minWidth={32}>Gas:&nbsp;{numberFormat.format(block.header.gas_used as bigint)}</Text>
      <Text>Difficulty:&nbsp;{numberFormat.format(BigInt(block.header.difficulty_number))}</Text>
    </Box>
  )
}
