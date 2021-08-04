import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'
import type { Static } from '@sinclair/typebox'
import type { types } from '@starcoin/starcoin'
import useJsonRpc from 'hooks/use-json-rpc'
import { useMemo } from 'react'
import { formatNumber, formatTime } from 'utils/formatter'
import type { TransactionInfo } from 'utils/json-rpc/chain'

export default function TransactionStat(props: {
  payload?: types.TransactionPayload
  info?: Static<typeof TransactionInfo>
}) {
  const { payload, info } = props
  const status = useMemo(
    () =>
      info ? (typeof info.status === 'string' ? info.status : Object.keys(info.status)[0]) : '-',
    [info],
  )
  const { data: block } = useJsonRpc(
    'chain.get_block_by_hash',
    info ? [info.block_hash] : undefined,
  )

  return (
    <>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
          whiteSpace="nowrap"
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Height</StatLabel>
              <Skeleton isLoaded={!!info}>
                <StatNumber>#{info?.block_number}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Status</StatLabel>
              <Skeleton isLoaded={!!status}>
                <StatNumber color={status === 'Executed' ? 'green.500' : 'red.500'}>
                  {status}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Gas used</StatLabel>
              <Skeleton isLoaded={!!info}>
                <StatNumber>{info ? formatNumber(BigInt(info.gas_used)) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Payload</StatLabel>
              <Skeleton isLoaded={!!info}>
                <StatNumber>{payload ? Object.keys(payload)[0] : 'No payload'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={2}>
            <Stat>
              <StatLabel>Timestamp</StatLabel>
              <Skeleton isLoaded={!!block}>
                <StatNumber>
                  {block ? formatTime(parseInt(block.header.timestamp, 10)) : '-'}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
