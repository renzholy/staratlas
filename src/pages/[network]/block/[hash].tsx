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
  Text,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ListItemPlaceholder from 'components/list-item-placeholder'
import TransactionListItem from 'components/transaction-list-item'
import { CardWithHeader } from 'layouts/card-with-header'
import UncleListItem from 'components/uncle-list-item'
import BlockStat from 'components/block-stat'
import NotFound from 'components/not-fount'
import useNetwork from 'hooks/use-network'
import useJsonRpc from 'hooks/use-json-rpc'
import flatMap from 'lodash/flatMap'
import { textClass } from 'utils/style'

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
  const { data: transactions } = useJsonRpc(
    'chain.get_block_txn_infos',
    hash && isHash ? [hash] : block ? [block.header.body_hash] : undefined,
  )
  const ref = useRef<HTMLDivElement>(null)
  const { data: blocks } = useJsonRpc(
    'chain.get_epoch_uncles_by_number',
    block ? [parseInt(block.header.number, 10)] : undefined,
  )
  const toast = useToast()
  const uncles = useMemo(() => (blocks ? flatMap(blocks, (b) => b.uncles) : undefined), [blocks])
  useEffect(() => {
    if (!uncles || !block) {
      return
    }
    if (uncles.find(({ block_hash }) => block_hash === block.header.block_hash)) {
      router.push(`/${network}/uncle/${block.header.block_hash}`)
      toast({ title: `This is an uncle`, description: block.header.block_hash, status: 'warning' })
    }
  }, [uncles, network, router, block, toast])

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
            <Box paddingX={6} paddingY={4} css={textClass}>
              <Heading size="sm">Hash</Heading>
              <Text color="gray.500">{block.header.block_hash}</Text>
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
              <Text color="gray.500">{block.header.body_hash}</Text>
              <Heading size="sm" mt={4}>
                Block accumulator root
              </Heading>
              <Text color="gray.500">{block.header.block_accumulator_root}</Text>
              <Heading size="sm" mt={4}>
                State root
              </Heading>
              <Text color="gray.500">{block.header.state_root}</Text>
              <Heading size="sm" mt={4}>
                Txn accumulator root
              </Heading>
              <Text color="gray.500">{block.header.txn_accumulator_root}</Text>
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
            <Fragment key={transaction.transaction_hash}>
              {index === 0 ? null : <Divider />}
              <TransactionListItem transaction={transaction.transaction_hash} />
            </Fragment>
          ))}
          {transactions?.length ? null : (
            <ListItemPlaceholder height={67}>
              {transactions?.length === 0 ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
