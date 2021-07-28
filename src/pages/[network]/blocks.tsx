import { Fragment, useMemo, useRef, useEffect } from 'react'
import { Divider, Center, Box, Spinner } from '@chakra-ui/react'
import BlockListItem from 'components/block-list-item'
import { useBlocksByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import { CardWithHeader } from 'layouts/card-with-header'
import flatMap from 'lodash/flatMap'
import useOnScreen from 'hooks/use-on-screen'

export default function Blocks() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const { data, setSize } = useBlocksByHeight(info ? BigInt(info.head.number) : undefined, {
    revalidateOnFocus: false,
  })
  const blocks = useMemo(() => flatMap(data, (datum) => datum), [data])
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
        {blocks?.length ? (
          <CardWithHeader title="Blocks">
            {blocks.map((block, index) => (
              <Fragment key={block._id}>
                {index === 0 ? null : <Divider />}
                <BlockListItem block={block._id} />
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
