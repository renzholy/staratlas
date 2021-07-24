import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Link } from 'react-router-dom'
import TimeAgo from 'timeago-react'

import { useNetwork } from '../contexts/network'
import { formatTimeSimple, numberFormat } from '../utils/formatter'
import { Block } from '../utils/types'

export default function UncleListItem(props: {
  uncle: Block['uncles'][0]
  relativeTime?: boolean
}) {
  const { uncle } = props
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
      <Text
        css={css`
          float: right;
        `}
      >
        {props.relativeTime ? (
          <TimeAgo datetime={uncle.timestamp.toString()} />
        ) : (
          formatTimeSimple(parseInt(uncle.timestamp.toString(), 10))
        )}
      </Text>
      <Button
        as={Link}
        to={`/${network}/uncle/${uncle.block_hash}`}
        variant="link"
        color="purple.500"
        minWidth={32}
      >
        #{uncle.number}
      </Button>
      Author:&nbsp;
      <Button
        as={Link}
        to={`/${network}/address/${uncle.author}`}
        variant="link"
        color="green.500"
        width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (32px * 4) - 130px)' }}
      >
        {uncle.author}
      </Button>
      <br />
      <Text minWidth={32}>Gas:&nbsp;{numberFormat.format(uncle.gas_used as bigint)}</Text>
      <Text>Difficulty:&nbsp;{numberFormat.format(BigInt(uncle.difficulty_number))}</Text>
    </Box>
  )
}
