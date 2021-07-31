import { Grid, GridItem, Box, Heading, Spinner, Button, Divider, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ListItemPlaceholder from 'components/list-item-placeholder'
import useNetwork from 'hooks/use-network'
import { CardWithHeader } from 'layouts/card-with-header'
import CopyLink from 'components/copy-link'
import UncleStat from 'components/uncle-stat'
import NotFound from 'components/not-fount'
import useJsonRpc from 'hooks/use-json-rpc'
import { Fragment, useEffect, useMemo } from 'react'
import UncleListItem from 'components/uncle-list-item'
import flatMap from 'lodash/flatMap'
import { textClass } from 'utils/style'

export default function Uncle() {
  const network = useNetwork()
  const router = useRouter()
  const { hash } = router.query as { hash?: string }
  const { data: uncle, error } = useJsonRpc('chain.get_block_by_hash', hash ? [hash] : undefined, {
    revalidateOnFocus: false,
  })
  const { data: blocks } = useJsonRpc(
    'chain.get_epoch_uncles_by_number',
    uncle ? [parseInt(uncle.header.number, 10)] : undefined,
  )
  const toast = useToast()
  const uncles = useMemo(() => (blocks ? flatMap(blocks, (b) => b.uncles) : undefined), [blocks])
  useEffect(() => {
    if (!uncles || !uncle) {
      return
    }
    if (uncles.find(({ block_hash }) => block_hash === uncle.header.block_hash)) {
      return
    }
    router.push(`/${network}/block/${uncle.header.block_hash}`)
    toast({ title: `This is a block`, description: uncle.header.block_hash, status: 'warning' })
  }, [uncles, network, router, uncle, toast])

  if (error) {
    return <NotFound />
  }
  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <UncleStat uncle={uncle?.header} />
      <GridItem colSpan={1}>
        <CardWithHeader title="Uncle">
          {uncle ? (
            <Box paddingX={6} paddingY={4} css={textClass}>
              <Heading size="sm">Hash</Heading>
              <CopyLink>{uncle.header.block_hash}</CopyLink>
              <Heading size="sm" mt={4}>
                Author
              </Heading>
              <Link href={`/${network}/address/${uncle.header.author}`} passHref={true}>
                <Button as="a" variant="link" color="green.500">
                  {uncle.header.author}
                </Button>
              </Link>
              <Heading size="sm" mt={4}>
                Parent hash
              </Heading>
              <Link href={`/${network}/block/${uncle.header.parent_hash}`} passHref={true}>
                <Button as="a" variant="link" color="blue.500">
                  {uncle.header.parent_hash}
                </Button>
              </Link>
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
      <GridItem colSpan={1}>
        <CardWithHeader title="Uncles">
          {uncle?.uncles.length ? (
            uncle.uncles.map((u, index) => (
              <Fragment key={u.block_hash}>
                {index === 0 ? null : <Divider />}
                <UncleListItem uncle={u} />
              </Fragment>
            ))
          ) : (
            <ListItemPlaceholder height={67}>
              {uncle?.uncles.length === 0 ? 'No uncle' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
