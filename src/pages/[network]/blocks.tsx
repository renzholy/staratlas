import { Fragment, useRef, useEffect } from 'react'
import { Divider, Grid, GridItem, Spinner } from '@chakra-ui/react'
import BlockListItem from 'components/block-list-item'
import useJsonRpc from 'hooks/use-json-rpc'
import { CardWithHeader } from 'layouts/card-with-header'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useInfinite from 'hooks/use-infinite'
import { useSWRInfinite } from 'swr'
import useNetwork from 'hooks/use-network'
import { Network } from 'utils/types'
import { jsonRpc } from 'utils/json-rpc'
import last from 'lodash/last'
import { RPC_BLOCK_LIMIT } from 'utils/constants'

export default function Blocks() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const network = useNetwork()
  const list = useSWRInfinite(
    (_, previousPageData) => {
      if (!info) {
        return null
      }
      if (previousPageData && !previousPageData.length) {
        return null
      }
      if (previousPageData) {
        return [network, parseInt(last(previousPageData)!.header.number, 10) - 1]
      }
      return [network, parseInt(info.head.number, 10)]
    },
    async (net: Network, number: number) =>
      jsonRpc(net, 'chain.get_blocks_by_number', [number, RPC_BLOCK_LIMIT]),
  )
  const { data: blocks, setSize, isEmpty, isReachingEnd } = useInfinite(list)
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref, '-20px')
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize])

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
        <CardWithHeader title="Blocks">
          {blocks?.map((block, index) => (
            <Fragment key={block.header.block_hash}>
              {index === 0 ? null : <Divider />}
              <BlockListItem block={block} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={67}>
              {isEmpty ? 'No blocks' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
