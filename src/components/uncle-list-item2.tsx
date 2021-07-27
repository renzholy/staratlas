import { Box } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { css } from '@emotion/react'
import Link from 'next/link'
import TimeAgo from 'timeago-react'
import useNetwork from 'hooks/use-network'
import { formatTimeSimple, formatNumber } from 'utils/formatter'
import useJsonRpc from 'hooks/use-json-rpc'

export default function UncleListItem2(props: { uncle: string; relativeTime?: boolean }) {
  const { data: uncle } = useJsonRpc('chain.get_block_by_hash', [props.uncle])
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
        <Link href={`/${network}/uncle/${uncle?.header.block_hash}`} passHref={true}>
          <Button as="a" variant="link" color="purple.500">
            #{uncle?.header.number}
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
            <TimeAgo datetime={uncle.header.timestamp} />
          ) : (
            formatTimeSimple(parseInt(uncle.header.timestamp, 10))
          )
        ) : (
          '-'
        )}
      </Text>
      Author:&nbsp;
      <Link href={`/${network}/address/${uncle?.header.author}`} passHref={true}>
        <Button
          as="a"
          variant="link"
          color="green.500"
          width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (32px * 4) - 130px)' }}
        >
          {uncle?.header.author}
        </Button>
      </Link>
      <br />
      <Text minWidth={32}>
        Gas:&nbsp;{uncle ? formatNumber(BigInt(uncle.header.gas_used)) : '-'}
      </Text>
      <Text>Difficulty:&nbsp;{uncle ? formatNumber(BigInt(uncle.header.difficulty)) : '-'}</Text>
    </Box>
  )
}
