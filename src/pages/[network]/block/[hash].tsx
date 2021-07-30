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
import { Fragment, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ListItemPlaceholder from 'components/list-item-placeholder'
import TransactionListItem from 'components/transaction-list-item'
import { CardWithHeader } from 'layouts/card-with-header'
import CopyLink from 'components/copy-link'
import UncleListItem from 'components/uncle-list-item'
import BlockStat from 'components/block-stat'
import NotFound from 'components/not-fount'
import useNetwork from 'hooks/use-network'
import useJsonRpc from 'hooks/use-json-rpc'
import { useTransactionsByHeight } from 'hooks/use-api'
import useOnScreen from 'hooks/use-on-screen'
import useInfinite from 'hooks/use-infinite'

export default function Block() {
  const router = useRouter()
  const network = useNetwork()
  const { hash } = router.query as { hash?: string }
  const { colorMode } = useColorMode()
  const isHash = hash?.startsWith('0x')
  const isHeight = hash && /^\d+$/.test(hash)
  const { data: block, error } = useJsonRpc(
    isHash ? 'chain.get_block_by_hash' : isHeight ? 'chain.get_block_by_number' : undefined,
    hash ? (isHash ? [hash] : isHeight ? [parseInt(hash, 10)] : undefined) : undefined,
    {
      revalidateOnFocus: false,
    },
  )
  const {
    data: transactions,
    setSize,
    isEmpty,
    isReachingEnd,
  } = useInfinite(useTransactionsByHeight(block ? BigInt(block.header.number) : undefined, true))
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref, '-20px')
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize])
  const { data: blocks } = useJsonRpc(
    'chain.get_epoch_uncles_by_number',
    block ? [parseInt(block.header.number, 10)] : undefined,
  )
  useEffect(() => {
    if (!blocks || !block) {
      return
    }
    if (
      blocks.find(({ uncles }) =>
        uncles.find(({ block_hash }) => block_hash === block.header.block_hash),
      )
    ) {
      router.push(`/${network}/uncle/${block.header.block_hash}`)
    }
  }, [blocks, network, router, block])

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
                  <Link
                    href={`/${network}/block/${BigInt(block.header.number) - BigInt(1)}`}
                    passHref={true}
                  >
                    <IconButton
                      as="a"
                      aria-label="prev block"
                      icon={<ChevronLeftIcon />}
                      mr="-px"
                      bg={colorMode === 'light' ? 'white' : undefined}
                    />
                  </Link>
                  <Link
                    href={`/${network}/block/${BigInt(block.header.number) + BigInt(1)}`}
                    passHref={true}
                  >
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
        <Spacer h={6} />
        <CardWithHeader title="Uncles">
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
      <GridItem colSpan={1}>
        <CardWithHeader title="Transactions">
          {transactions?.map((transaction, index) => (
            <Fragment key={transaction._id}>
              {index === 0 ? null : <Divider />}
              <TransactionListItem transaction={transaction._id} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={67}>
              {isEmpty ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
