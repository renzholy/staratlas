import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  useColorMode,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import ResourceListItem from 'components/resource-list-item'
import ListItemPlaceholder from 'components/list-item-placeholder'
import NotFound from 'components/not-fount'
import TransactionListItem from 'components/transaction-list-item'
import { useBalances, useResources } from 'hooks/use-provider'
import { CardWithHeader } from 'layouts/card-with-header'
import BalanceAmount from 'components/balance-amount'
import { useListByAddress } from 'hooks/use-api'
import useOnScreen from 'hooks/use-on-screen'
import useInfinite from 'hooks/use-infinite'
import startCase from 'lodash/startCase'
import { Type } from 'utils/api'

export default function Address() {
  const router = useRouter()
  const { hash } = router.query as { hash?: string }
  const { data: resources, error } = useResources(hash)
  const [type, setType] = useState<Type>('transaction')
  const list = useListByAddress(type, hash)
  const { data: transactions, setSize, isEmpty, isReachingEnd } = useInfinite(list)
  const { data: balances } = useBalances(hash)
  const ref = useRef<HTMLDivElement>(null)
  const isNearBottom = useOnScreen(ref, '-20px')
  useEffect(() => {
    if (isNearBottom) {
      setSize((old) => old + 1)
    }
  }, [isNearBottom, setSize])
  const { colorMode } = useColorMode()

  if (error) {
    return <NotFound />
  }
  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1} paddingX={6}>
        <Stat>
          <StatLabel>Address</StatLabel>
          <StatNumber>{hash?.toLowerCase()}</StatNumber>
        </Stat>
      </GridItem>
      <GridItem colSpan={1} display={{ base: 'none', xl: 'block' }} />
      <GridItem colSpan={1}>
        <CardWithHeader title="Balances">
          {balances ? (
            <Box paddingX={6} paddingY={4}>
              {Object.entries(balances).map(([key, value], index) => (
                <Fragment key={key}>
                  <Heading size="sm" mt={index === 0 ? 0 : 4}>
                    {key}
                  </Heading>
                  <BalanceAmount token={key} value={value} />
                </Fragment>
              ))}
            </Box>
          ) : (
            <ListItemPlaceholder height={75}>
              {balances && Object.entries(balances).length === 0 ? 'No balances' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <Spacer height={6} />
        <CardWithHeader title="Resources">
          {resources ? (
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
              {Object.entries(resources).map(([key, value], index) => (
                <Fragment key={key}>
                  {index === 0 ? null : <Divider mt={3} />}
                  <Heading size="sm" mt={index === 0 ? 0 : 4}>
                    {key}
                  </Heading>
                  <ResourceListItem resource={value} />
                </Fragment>
              ))}
            </Box>
          ) : (
            <ListItemPlaceholder height={75}>
              {resources && Object.entries(resources).length === 0 ? 'No resource' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <CardWithHeader
          title={`${startCase(type)}s`}
          subtitle={
            <ButtonGroup
              size="sm"
              isAttached={true}
              variant={colorMode === 'light' ? 'outline' : undefined}
              spacing={0}
              mr={-4}
            >
              <Button
                mr="-px"
                bg={colorMode === 'light' ? 'white' : undefined}
                onClick={() => setType('transaction')}
                isActive={type === 'transaction'}
              >
                Transactions
              </Button>
              <Button
                mr="-px"
                bg={colorMode === 'light' ? 'white' : undefined}
                onClick={() => setType('block')}
                isActive={type === 'block'}
              >
                Blocks
              </Button>
            </ButtonGroup>
          }
        >
          {transactions?.map((transaction, index) => (
            <Fragment key={transaction._id}>
              {index === 0 ? null : <Divider />}
              <TransactionListItem transaction={transaction._id} />
            </Fragment>
          ))}
          {isReachingEnd && !isEmpty ? null : (
            <ListItemPlaceholder height={75}>
              {isEmpty ? 'No transactions' : <Spinner />}
            </ListItemPlaceholder>
          )}
        </CardWithHeader>
        <div ref={ref} />
      </GridItem>
    </Grid>
  )
}
