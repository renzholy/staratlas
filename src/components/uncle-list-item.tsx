import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import Link from 'next/link'
import TimeAgo from 'timeago-react'
import useNetwork from 'hooks/use-network'
import { formatTimeSimple, formatNumber } from 'utils/formatter'
import { Static } from '@sinclair/typebox'
import { BlockHeader } from 'utils/json-rpc/chain'

export default function UncleListItem(props: {
  uncle: Static<typeof BlockHeader>
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
      <Box width={32} display="inline-block">
        <Link href={`/${network}/uncle/${uncle?.block_hash}`} passHref={true}>
          <Button as="a" variant="link" color="purple.500">
            #{uncle?.number}
          </Button>
        </Link>
      </Box>
      <Text
        css={css`
          float: right;
        `}
      >
        {uncle ? (
          props.relativeTime ? (
            <TimeAgo datetime={uncle.timestamp} />
          ) : (
            formatTimeSimple(parseInt(uncle.timestamp, 10))
          )
        ) : (
          '-'
        )}
      </Text>
      Author:&nbsp;
      <Box
        width={{ base: '100%', md: 'calc(100% - (4px * 6 * 2) - (32px * 4) - 130px)' }}
        display="inline-block"
      >
        <Link href={`/${network}/address/${uncle?.author}`} passHref={true}>
          <Button as="a" variant="link" color="green.500">
            {uncle?.author}
          </Button>
        </Link>
      </Box>
      <br />
      <Text>Difficulty:&nbsp;{uncle ? formatNumber(BigInt(uncle.difficulty)) : '-'}</Text>
    </Box>
  )
}
