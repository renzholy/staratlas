import { Fragment, useEffect, useRef } from 'react'
import { Divider, Grid, GridItem, Spinner } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useInfinite from 'hooks/use-infinite'
import useSWRInfinite from 'swr/infinite'
import { jsonRpc } from 'utils/json-rpc'
import useNetwork from 'hooks/use-network'
import { Network } from 'utils/types'
import last from 'lodash/last'
import flatMap from 'lodash/flatMap'

export default function Uncles() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const network = useNetwork()
  const {
    data: uncles,
    setSize,
    isEmpty,
    isReachingEnd,
  } = useInfinite(
    useSWRInfinite(
      info
        ? (_, previousPageData) => {
            if (previousPageData && !previousPageData.length) {
              return null
            }
            if (previousPageData) {
              return [network, last(previousPageData)!.epoch.start_block_number - 1, 'uncles']
            }
            return [network, parseInt(info.head.number, 10), 'uncles']
          }
        : null,
      async (net: Network, number: number) => {
        const [blocks, epoch] = await Promise.all([
          jsonRpc(net, 'chain.get_epoch_uncles_by_number', number),
          jsonRpc(net, 'chain.get_epoch_info_by_number', number),
        ])
        return flatMap(blocks.reverse(), (block) =>
          block.uncles.map((uncle) => ({ uncle, ...epoch })),
        )
      },
      { revalidateOnFocus: false },
    ),
    1,
  )
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref)
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize, uncles])

  return (
    <Grid
      templateColumns={{
        base: 'minmax(0, 1fr)',
        xl: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
      }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={{ base: 1, xl: 2 }} colStart={{ base: 1, xl: 2 }}>
        <CardWithHeader title="Uncles">
          {uncles?.map(({ uncle }, index) => (
            <Fragment key={uncle.block_hash}>
              {index === 0 ? null : <Divider />}
              <UncleListItem uncle={uncle} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={67}>
              {isEmpty ? 'No uncles' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
