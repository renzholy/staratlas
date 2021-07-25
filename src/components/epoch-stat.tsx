import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'
import last from 'lodash/last'
import sumBy from 'lodash/sumBy'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TimeAgo from 'timeago-react'

import { useNetwork } from '../contexts/network'
import { useResource } from '../hooks/use-provider'
import { formatNumber } from '../utils/formatter'
import { Block } from '../utils/types'

export default function EpochStat(props: { blocks?: Block[] }) {
  const network = useNetwork()
  const { data: epoch } = useResource('0x1', '0x1::Epoch::Epoch', { refreshInterval: 60000 })
  const hashRate = useMemo(() => {
    if (!props.blocks?.length) {
      return 0
    }
    const totalDifficulty = sumBy(props.blocks, 'header.difficulty_number')
    const averageBlockDiff = totalDifficulty / props.blocks.length
    const endTime = props.blocks[0].header.timestamp
    const startTime = last(props.blocks)!.header.timestamp
    const blockTime =
      ((endTime as unknown as number) - (startTime as unknown as number)) / props.blocks.length
    return (averageBlockDiff / blockTime) * 1000
  }, [props.blocks])

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
              <StatLabel>Epoch</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>{epoch?.number}th</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Start time</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>
                  <TimeAgo datetime={epoch?.start_time} />
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Hash rate</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>{formatNumber(Math.round(hashRate))}H/s</StatNumber>
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
              <StatLabel>Start block</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber
                  as={Link}
                  to={`/${network}/block/${epoch?.start_block_number}`}
                  color="blue.500"
                >
                  #{epoch?.start_block_number}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>End block</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber
                  as={Link}
                  to={`/${network}/block/${epoch?.end_block_number}`}
                  color="blue.500"
                >
                  #{epoch?.end_block_number}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Block time</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>
                  {formatNumber(Math.round(epoch?.block_time_target / 100) / 10)}s
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
