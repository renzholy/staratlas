import { Grid, GridItem, Box, Heading, Spinner, Button } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Link, useParams } from 'react-router-dom'

import ListItemPlaceholder from '../components/list-item-placeholder'
import { useNetwork } from '../contexts/network'
import { useUncleBlock } from '../hooks/use-block-api'
import { CardWithHeader } from '../layouts/card-with-header'
import CopyLink from '../components/copy-link'
import BlockStat from '../components/block-stat'

export default function Uncle() {
  const network = useNetwork()
  const params = useParams<{ hash: string }>()
  const { data: uncle } = useUncleBlock(params.hash)

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <BlockStat block={uncle?.header} />
      <GridItem colSpan={1}>
        <CardWithHeader title="Uncle">
          {uncle ? (
            <Box
              paddingX={6}
              paddingY={4}
              css={css`
                button,
                a {
                  text-overflow: ellipsis;
                  overflow: hidden;
                  white-space: nowrap;
                  max-width: 100%;
                  display: inline-block;
                  text-align: start;
                  font-weight: normal;
                }
              `}
            >
              <Heading size="sm">Hash</Heading>
              <CopyLink>{uncle.header.block_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                Author
              </Heading>
              <Button
                as={Link}
                to={`/${network}/address/${uncle.header.author}`}
                variant="link"
                color="green.500"
              >
                {uncle.header.author}
              </Button>
              <Heading size="sm" mt={4}>
                Parent hash
              </Heading>
              <Button
                as={Link}
                to={`/${network}/block/${uncle.header.parent_hash}`}
                variant="link"
                color="blue.500"
              >
                {uncle.header.parent_hash}
              </Button>
              <Heading size="sm" mt={4}>
                Body hash
              </Heading>
              <CopyLink>{uncle.header.body_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                Block accumulator root
              </Heading>
              <CopyLink>{uncle.header.block_accumulator_root}</CopyLink>
              <Heading size="sm" mt={4}>
                State root
              </Heading>
              <CopyLink>{uncle.header.state_root}</CopyLink>
              <Heading size="sm" mt={4}>
                Txn accumulator root
              </Heading>
              <CopyLink>{uncle.header.txn_accumulator_root}</CopyLink>
            </Box>
          ) : (
            <ListItemPlaceholder height={429}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
