import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'

import { formatNumber, formatTime } from '../utils/formatter'
import { Block } from '../utils/types'

export default function BlockStat(props: { block?: Block['header'] }) {
  const { block } = props

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
              <Skeleton isLoaded={!!block}>
                <StatNumber>#{block?.number}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Difficulty</StatLabel>
              <Skeleton isLoaded={!!block}>
                <StatNumber>
                  {block ? formatNumber(BigInt(block.difficulty_number)) : '-'}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Gas used</StatLabel>
              <Skeleton isLoaded={!!block}>
                <StatNumber>{block ? formatNumber(block.gas_used as bigint) : '-'}</StatNumber>
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
              <StatLabel>Nonce</StatLabel>
              <Skeleton isLoaded={!!block}>
                <StatNumber>{block ? formatNumber(block.nonce as bigint) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={2}>
            <Stat>
              <StatLabel>Timestamp</StatLabel>
              <Skeleton isLoaded={!!block}>
                <StatNumber>{block ? formatTime(parseInt(block.timestamp, 10)) : '-'}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
