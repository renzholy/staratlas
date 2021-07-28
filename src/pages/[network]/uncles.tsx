import { Fragment, useEffect, useMemo, useRef } from 'react'
import { Divider, Box, Center, Spinner } from '@chakra-ui/react'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import { useUnclesByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import useOnScreen from 'hooks/use-on-screen'
import flatMap from 'lodash/flatMap'

export default function Uncles() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const { data, setSize } = useUnclesByHeight(info ? BigInt(info.head.number) : undefined, {
    revalidateOnFocus: false,
  })
  const uncles = useMemo(() => flatMap(data, (datum) => datum), [data])
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref, '-20px')
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize])

  return (
    <Center gap={6} padding={6} width="100%">
      <Box maxWidth="xl">
        {uncles?.length ? (
          <CardWithHeader title="Uncles">
            {uncles.map((uncle, index) => (
              <Fragment key={uncle._id}>
                {index === 0 ? null : <Divider />}
                <UncleListItem uncle={uncle._id} />
              </Fragment>
            ))}
          </CardWithHeader>
        ) : (
          <Spinner />
        )}
        <div ref={ref} />
      </Box>
    </Center>
  )
}
