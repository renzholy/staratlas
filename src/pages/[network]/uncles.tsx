import { Fragment, useEffect, useRef } from 'react'
import { Divider, Grid, GridItem, Spinner } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import { useListByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useInfinite from 'hooks/use-infinite'

export default function Uncles() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const list = useListByHeight('uncle', info ? BigInt(info.head.number) : undefined, false, {
    revalidateOnFocus: false,
  })
  const { data: uncles, setSize, isEmpty, isReachingEnd } = useInfinite(list)
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
        <CardWithHeader title="Uncles">
          {uncles?.map((uncle, index) => (
            <Fragment key={uncle._id}>
              {index === 0 ? null : <Divider />}
              <UncleListItem uncle={uncle._id} />
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
