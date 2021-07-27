import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Grid,
  GridItem,
  Box,
  Heading,
  Divider,
  Spacer,
  Spinner,
  ButtonGroup,
  IconButton,
  Button,
  useColorMode,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ListItemPlaceholder from 'components/list-item-placeholder'
import TransactionListItem from 'components/transaction-list-item'
import { useBlock } from 'hooks/use-block-api'
import { useBlockTransactions } from 'hooks/use-transaction-api'
import { CardWithHeader } from 'layouts/card-with-header'
import { formatNumber } from 'utils/formatter'
import CopyLink from 'components/copy-link'
import UncleListItem from 'components/uncle-list-item'
import BlockStat from 'components/block-stat'
import NotFound from 'components/not-fount'
import useNetwork from 'hooks/use-network'

export default function Block() {
  const router = useRouter()
  const network = useNetwork()
  const { hash } = router.query as { hash?: string }
  const { colorMode } = useColorMode()
  const { data: block, error } = useBlock(hash)
  const { data: transactions } = useBlockTransactions(block?.header.block_hash)

  if (error) {
    return <NotFound />
  }
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
                  <Link href={`/${network}/block/${block.header.number - 1}`} passHref={true}>
                    <IconButton
                      as="a"
                      aria-label="prev block"
                      icon={<ChevronLeftIcon />}
                      mr="-px"
                      bg={colorMode === 'light' ? 'white' : undefined}
                    />
                  </Link>
                  <Link href={`/${network}/block/${block.header.number + 1}`} passHref={true}>
                    <IconButton
                      as="a"
                      aria-label="next block"
                      icon={<ChevronRightIcon />}
                      bg={colorMode === 'light' ? 'white' : undefined}
                    />
                  </Link>
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
              <Link href={`/${network}/address/${block.header.author}`} passHref={true}>
                <Button as="a" variant="link" color="green.500">
                  {block.header.author}
                </Button>
              </Link>
              <Heading size="sm" mt={4}>
                Parent hash
              </Heading>
              <Link href={`/${network}/block/${block.header.parent_hash}`} passHref={true}>
                <Button as="a" variant="link" color="blue.500">
                  {block.header.parent_hash}
                </Button>
              </Link>
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
          subtitle={`Total: ${transactions ? formatNumber(transactions.total) : '-'}`}
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
          subtitle={`Total: ${block ? formatNumber(block.uncles.length) : '-'}`}
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
