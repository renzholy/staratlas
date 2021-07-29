import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Divider, Grid, GridItem, Spinner } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import { useUnclesByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import flatten from 'lodash/flatten'
import ListItemPlaceholder from 'components/list-item-placeholder'

export default function Uncles() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const { data, setSize } = useUnclesByHeight(info ? BigInt(info.head.number) : undefined, {
    revalidateOnFocus: false,
    revalidateAll: false,
  })
  const uncles = useMemo(() => (data ? flatten(data) : undefined), [data])
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
          {uncles?.length ? (
            uncles.map((uncle, index) => (
              <Fragment key={uncle._id}>
                {index === 0 ? null : <Divider />}
                <UncleListItem uncle={uncle._id} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
