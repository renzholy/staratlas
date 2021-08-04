import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'
import type { BlockHeader } from 'utils/json-rpc/chain'
import { formatNumber, formatTime } from 'utils/formatter'
import type { Static } from '@sinclair/typebox'

export default function UncleStat(props: { uncle?: Static<typeof BlockHeader> }) {
  const { uncle } = props

  return (
    <>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
          whiteSpace="nowrap"
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Height</StatLabel>
              <Skeleton isLoaded={!!uncle}>
                <StatNumber>#{uncle?.number}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Difficulty</StatLabel>
              <Skeleton isLoaded={!!uncle}>
                <StatNumber>{uncle ? formatNumber(BigInt(uncle.difficulty)) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Nonce</StatLabel>
              <Skeleton isLoaded={!!uncle}>
                <StatNumber>{uncle ? formatNumber(BigInt(uncle.nonce)) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Timestamp</StatLabel>
              <Skeleton isLoaded={!!uncle}>
                <StatNumber>{uncle ? formatTime(parseInt(uncle.timestamp, 10)) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
