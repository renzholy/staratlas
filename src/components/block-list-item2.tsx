import { Box, Text } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/react'
import { css } from '@emotion/react'
import Link from 'next/link'
import TimeAgo from 'timeago-react'
import useNetwork from 'hooks/use-network'
import { formatTimeSimple, formatNumber } from 'utils/formatter'
import useJsonRpc from 'hooks/use-json-rpc'

export default function BlockListItem2(props: { block: string; relativeTime?: boolean }) {
  const { data: block } = useJsonRpc('chain.get_block_by_hash', [props.block])
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
        <Link href={`/${network}/block/${block?.header.number}`} passHref={true}>
          <Button as="a" variant="link" color="blue.500">
            #{block?.header.number}
          </Button>
        </Link>
      </Box>
      <Text
        css={css`
          float: right;
        `}
      >
        {block ? (
          props.relativeTime ? (
            <TimeAgo datetime={block.header.timestamp.toString()} />
          ) : (
            formatTimeSimple(parseInt(block.header.timestamp.toString(), 10))
          )
        ) : (
          '-'
        )}
      </Text>
      Author:&nbsp;
      <Link href={`/${network}/address/${block?.header.author}`} passHref={true}>
        <Button
          as="a"
          variant="link"
          color="green.500"
          width={{ base: undefined, md: 'calc(100% - (4px * 6 * 2) - (32px * 4) - 130px)' }}
        >
          {block?.header.author || '-'}
        </Button>
      </Link>
      <br />
      <Text minWidth={32}>Txns:&nbsp;{block ? formatNumber(block.body.Full.length) : '-'}</Text>
      <Text minWidth={32}>Uncles:&nbsp;{block ? formatNumber(block.uncles.length) : '-'}</Text>
      <Text minWidth={32}>
        Gas:&nbsp;{block ? formatNumber(BigInt(block.header.gas_used)) : '-'}
      </Text>
      <Text>Difficulty:&nbsp;{block ? formatNumber(BigInt(block.header.difficulty)) : '-'}</Text>
    </Box>
  )
}