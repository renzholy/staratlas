import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'
import Link from 'next/link'
import TimeAgo from 'timeago-react'
import useNetwork from 'hooks/use-network'
import { formatNumber } from 'utils/formatter'
import useJsonRpc from 'hooks/use-json-rpc'

export default function EpochStat() {
  const network = useNetwork()
  const { data: epoch } = useJsonRpc('chain.epoch', [])

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
                <StatNumber>{epoch?.epoch.number}th</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Start time</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>
                  <TimeAgo datetime={epoch?.epoch.start_time || 0} />
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Reward per block</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>{formatNumber(epoch?.epoch.reward_per_block || 0)}</StatNumber>
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
                <Link href={`/${network}/block/${epoch?.epoch.start_block_number}`} passHref={true}>
                  <StatNumber as="a" color="blue.500">
                    #{epoch?.epoch.start_block_number}
                  </StatNumber>
                </Link>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>End block</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <Link href={`/${network}/block/${epoch?.epoch.end_block_number}`} passHref={true}>
                  <StatNumber as="a" color="blue.500">
                    #{epoch?.epoch.end_block_number}
                  </StatNumber>
                </Link>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Block time</StatLabel>
              <Skeleton isLoaded={!!epoch}>
                <StatNumber>
                  {formatNumber(Math.round((epoch?.epoch.block_time_target || 0) / 100) / 10)}s
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
