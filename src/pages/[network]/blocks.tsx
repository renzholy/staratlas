import { Fragment, useState } from 'react'
import {
  Divider,
  Grid,
  GridItem,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Skeleton,
  ButtonGroup,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

import { useBlockList, useUncleBlockList } from 'hooks/use-block-api'
import BlockListItem from 'components/block-list-item'
import ListItemPlaceholder from 'components/list-item-placeholder'
import { CardWithHeader } from 'layouts/card-with-header'
import { formatNumber } from 'utils/formatter'
import UncleListItem from 'components/uncle-list-item'

const SIZE = 20

export default function Blocks() {
  const [blockPage, setBlockPage] = useState(1)
  const [unclePage, setUnclePage] = useState(1)
  const { data: blocks } = useBlockList(blockPage, { revalidateOnFocus: false })
  const { data: uncles } = useUncleBlockList(unclePage, { revalidateOnFocus: false })
  const { colorMode } = useColorMode()

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Blocks</StatLabel>
          <Skeleton isLoaded={!!blocks}>
            <StatNumber>{formatNumber(blocks?.total || 0)}</StatNumber>
          </Skeleton>
        </Stat>
      </GridItem>
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Uncles</StatLabel>
          <Skeleton isLoaded={!!uncles}>
            <StatNumber>{formatNumber(uncles?.total || 0)}</StatNumber>
          </Skeleton>
        </Stat>
      </GridItem>
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
                <Tooltip label={`page ${blockPage - 1}`} placement="top">
                  <IconButton
                    aria-label="prev block"
                    icon={<ChevronLeftIcon />}
                    mr="-px"
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setBlockPage((old) => old - 1)
                    }}
                    disabled={blockPage === 1}
                  />
                </Tooltip>
                <Tooltip label={`page ${blockPage + 1}`} placement="top">
                  <IconButton
                    aria-label="next block"
                    icon={<ChevronRightIcon />}
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setBlockPage((old) => old + 1)
                    }}
                  />
                </Tooltip>
              </ButtonGroup>
            </>
          }
        >
          {blocks?.contents.length ? (
            blocks.contents.map((block, index) => (
              <Fragment key={block.header.block_hash}>
                {index === 0 ? null : <Divider />}
                <BlockListItem block={block} />
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
                <Tooltip label={`page ${unclePage - 1}`} placement="top">
                  <IconButton
                    aria-label="prev uncle"
                    icon={<ChevronLeftIcon />}
                    mr="-px"
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setUnclePage((old) => old - 1)
                    }}
                    disabled={unclePage === 1}
                  />
                </Tooltip>
                <Tooltip label={`page ${unclePage + 1}`} placement="top">
                  <IconButton
                    aria-label="next uncle"
                    icon={<ChevronRightIcon />}
                    bg={colorMode === 'light' ? 'white' : undefined}
                    onClick={() => {
                      setUnclePage((old) => old + 1)
                    }}
                  />
                </Tooltip>
              </ButtonGroup>
            </>
          }
        >
          {uncles?.contents.length ? (
            uncles.contents.map((uncle, index) => (
              <Fragment key={uncle.header.block_hash}>
                {index === 0 ? null : <Divider />}
                <UncleListItem uncle={uncle.header} />
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
