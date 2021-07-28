import { Fragment, useState, useEffect } from 'react'
import { Divider, Center, Box, Spinner } from '@chakra-ui/react'
import BlockListItem from 'components/block-list-item'
import { useBlocksByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'
import { CardWithHeader } from 'layouts/card-with-header'

export default function Blocks() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const [blockHeight, setBlockHeight] = useState<bigint | undefined>()
  const { data: blocks } = useBlocksByHeight(blockHeight, { revalidateOnFocus: false })
  useEffect(() => {
    setBlockHeight(info ? BigInt(info.head.number) : undefined)
  }, [info])

  return (
    <Center gap={6} padding={6} width="100%">
      <Box maxWidth="xl">
        {blocks?.length ? (
          <CardWithHeader>
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
      </Box>
    </Center>
  )
}
