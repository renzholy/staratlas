import { Fragment, useEffect, useRef } from 'react'
import { Divider, Spinner, GridItem, Grid } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import EventCardItem from 'components/event-card-item'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useInfinite from 'hooks/use-infinite'
import { useSWRInfinite } from 'swr'
import { jsonRpc } from 'utils/json-rpc'
import useNetwork from 'hooks/use-network'
import { RPC_BLOCK_LIMIT } from 'utils/constants'
import { Network } from 'utils/types'
import { Static } from '@sinclair/typebox'
import { TransactionEvent } from 'utils/json-rpc/chain'
import last from 'lodash/last'

export default function Events() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const network = useNetwork()
  const {
    data: events,
    setSize,
    isEmpty,
    isReachingEnd,
  } = useInfinite(
    useSWRInfinite<Static<typeof TransactionEvent>[]>(
      (_, previousPageData) => {
        if (previousPageData && !previousPageData.length) {
          return null
        }
        if (previousPageData) {
          return [network, parseInt(last(previousPageData)!.block_number, 10) - 1, 'events']
        }
        return [network, info ? parseInt(info.head.number, 10) : RPC_BLOCK_LIMIT, 'events']
      },
      async (net: Network, height: number) =>
        jsonRpc(net, 'chain.get_events', [{ from_block: height - 1, to_block: height }]),
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
        <CardWithHeader title="Events">
          {events?.map((event, index) => (
            <Fragment key={event.block_hash + event.transaction_hash + event.event_seq_number}>
              {index === 0 ? null : <Divider />}
              <EventCardItem event={event} showHash={true} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={67}>
              {isEmpty ? 'No events' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
