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
import ListItemPlaceholder from 'components/list-item-placeholder'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import { useUnclesByHeight } from 'hooks/use-api'
import useJsonRpc from 'hooks/use-json-rpc'

const SIZE = 20

export default function Uncles() {
  const { data: info } = useJsonRpc('chain.info', [], { revalidateOnFocus: false })
  const [uncleHeight, setUncleHeight] = useState<bigint | undefined>()
  const { data: uncles } = useUnclesByHeight(uncleHeight, { revalidateOnFocus: false })
  useEffect(() => {
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
                <UncleListItem uncle={uncle._id} />
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
