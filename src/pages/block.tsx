import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Grid,
  GridItem,
  Box,
  Text,
  Heading,
  Divider,
  Spacer,
  Spinner,
  ButtonGroup,
  IconButton,
  Tooltip,
  Button,
  useColorMode,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Fragment } from 'react'
import { Link, useParams } from 'react-router-dom'

import ListItemPlaceholder from '../components/list-item-placeholder'
import TransactionListItem from '../components/transaction-list-item'
import { useNetwork } from '../contexts/network'
import { useBlock } from '../hooks/use-block-api'
import { useBlockTransactions } from '../hooks/use-transaction-api'
import { CardWithHeader } from '../layouts/card-with-header'
import { numberFormat } from '../utils/formatter'
import CopyLink from '../components/copy-link'
import UncleListItem from '../components/uncle-list-item'
import BlockStat from '../components/block-stat'

export default function Block() {
  const network = useNetwork()
  const { colorMode } = useColorMode()
  const params = useParams<{ hashOrHeight: string }>()
  const { data: block } = useBlock(params.hashOrHeight)
  const { data: transactions } = useBlockTransactions(block?.header.block_hash)

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <BlockStat block={block?.header} />
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Block"
          subtitle={
            block ? (
              <>
                <ButtonGroup
                  size="sm"
                  isAttached={true}
                  variant={colorMode === 'light' ? 'outline' : undefined}
                  spacing={0}
                  mr={-4}
                >
                  <Tooltip label={`#${block.header.number - 1}`} placement="top">
                    <IconButton
                      as={Link}
                      to={`/${network}/block/${block.header.number - 1}`}
                      aria-label="prev block"
                      icon={<ChevronLeftIcon />}
                      mr="-px"
                      bg={colorMode === 'light' ? 'white' : undefined}
                    />
                  </Tooltip>
                  <Tooltip label={`#${block.header.number + 1}`} placement="top">
                    <IconButton
                      as={Link}
                      to={`/${network}/block/${block.header.number + 1}`}
                      aria-label="next block"
                      icon={<ChevronRightIcon />}
                      bg={colorMode === 'light' ? 'white' : undefined}
                    />
                  </Tooltip>
                </ButtonGroup>
              </>
            ) : null
          }
        >
          {block ? (
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
                  vertical-align: text-bottom;
                  font-weight: normal;
                }
              `}
            >
              <Heading size="sm">Hash</Heading>
              <CopyLink>{block.header.block_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                Author
              </Heading>
              <Button
                as={Link}
                to={`/${network}/address/${block.header.author}`}
                variant="link"
                color="green.500"
              >
                {block.header.author}
              </Button>
              <Heading size="sm" mt={4}>
                Parent hash
              </Heading>
              <Button
                as={Link}
                to={`/${network}/block/${block.header.parent_hash}`}
                variant="link"
                color="blue.500"
              >
                {block.header.parent_hash}
              </Button>
              <Heading size="sm" mt={4}>
                Body hash
              </Heading>
              <CopyLink>{block.header.body_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                Block accumulator root
              </Heading>
              <CopyLink>{block.header.block_accumulator_root}</CopyLink>
              <Heading size="sm" mt={4}>
                State root
              </Heading>
              <CopyLink>{block.header.state_root}</CopyLink>
              <Heading size="sm" mt={4}>
                Txn accumulator root
              </Heading>
              <CopyLink>{block.header.txn_accumulator_root}</CopyLink>
            </Box>
          ) : (
            <ListItemPlaceholder height={429}>
              <Spinner />
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title="Transactions"
          subtitle={<Text>Total {numberFormat.format(transactions?.total || 0)} transactions</Text>}
        >
          {transactions?.contents.length ? (
            transactions.contents.map((transaction, index) => (
              <Fragment key={transaction.transaction_hash}>
                {index === 0 ? null : <Divider />}
                <TransactionListItem transaction={transaction} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {transactions?.contents.length === 0 ? 'No transaction' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer h={6} />
        <CardWithHeader
          title="Uncles"
          subtitle={<Text>Total {numberFormat.format(block?.uncles.length || 0)} uncles</Text>}
        >
          {block?.uncles.length ? (
            block.uncles.map((uncle, index) => (
              <Fragment key={uncle.block_hash}>
                {index === 0 ? null : <Divider />}
                <UncleListItem uncle={uncle} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {block?.uncles.length === 0 ? 'No uncle' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
