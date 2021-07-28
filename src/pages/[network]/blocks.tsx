import { Fragment, useState, useEffect } from 'react'
import {
  Divider,
  Grid,
  GridItem,
  Spinner,
  ButtonGroup,
  IconButton,
  useColorMode,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import BlockListItem2 from 'components/block-list-item2'
import ListItemPlaceholder from 'components/list-item-placeholder'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem2 from 'components/uncle-list-item2'
import { useBlocksByHeight, useUnclesByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'

const SIZE = 20

export default function Blocks() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const [blockHeight, setBlockHeight] = useState<bigint | undefined>()
  const [uncleHeight, setUncleHeight] = useState<bigint | undefined>()
  const { data: blocks } = useBlocksByHeight(blockHeight, { revalidateOnFocus: false })
  const { data: uncles } = useUnclesByHeight(uncleHeight, { revalidateOnFocus: false })
  useEffect(() => {
    setBlockHeight(info ? BigInt(info.head.number) : undefined)
    setUncleHeight(info ? BigInt(info.head.number) : undefined)
  }, [info])
  const { colorMode } = useColorMode()

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Blocks"
          subtitle={
            <>
              <ButtonGroup
                size="sm"
                isAttached={true}
                variant={colorMode === 'light' ? 'outline' : undefined}
                spacing={0}
                mr={-4}
              >
                <IconButton
                  aria-label="prev block"
                  icon={<ChevronLeftIcon />}
                  mr="-px"
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setBlockHeight((old) => (old ? old + BigInt(SIZE) : old))
                  }}
                  disabled={!info || !blockHeight || blockHeight >= BigInt(info.head.number)}
                />
                <IconButton
                  aria-label="next block"
                  icon={<ChevronRightIcon />}
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setBlockHeight((old) => (old ? old - BigInt(SIZE) : old))
                  }}
                  disabled={!blockHeight || blockHeight - BigInt(SIZE) <= BigInt(0)}
                />
              </ButtonGroup>
            </>
          }
        >
          {blocks?.length ? (
            blocks.map((block, index) => (
              <Fragment key={block._id}>
                {index === 0 ? null : <Divider />}
                <BlockListItem2 block={block._id} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={SIZE * 68 - 1}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Uncles"
          subtitle={
            <>
              <ButtonGroup
                size="sm"
                isAttached={true}
                variant={colorMode === 'light' ? 'outline' : undefined}
                spacing={0}
                mr={-4}
              >
                <IconButton
                  aria-label="prev uncle"
                  icon={<ChevronLeftIcon />}
                  mr="-px"
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setUncleHeight((old) => (old ? old + BigInt(SIZE) : old))
                  }}
                  disabled={!info || !uncleHeight || uncleHeight >= BigInt(info.head.number)}
                />
                <IconButton
                  aria-label="next uncle"
                  icon={<ChevronRightIcon />}
                  bg={colorMode === 'light' ? 'white' : undefined}
                  onClick={() => {
                    setUncleHeight((old) => (old ? old - BigInt(SIZE) : old))
                  }}
                  disabled={!uncleHeight || uncleHeight - BigInt(SIZE) <= BigInt(0)}
                />
              </ButtonGroup>
            </>
          }
        >
          {uncles?.length ? (
            uncles.map((uncle, index) => (
              <Fragment key={uncle._id}>
                {index === 0 ? null : <Divider />}
                <UncleListItem2 uncle={uncle._id} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={SIZE * 68 - 1}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
