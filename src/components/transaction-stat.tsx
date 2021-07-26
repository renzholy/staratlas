import { Grid, GridItem, Stat, StatLabel, Skeleton, StatNumber } from '@chakra-ui/react'
import { encoding } from '@starcoin/starcoin'
import { useMemo } from 'react'

import { formatNumber, formatTime } from '../utils/formatter'
import { Transaction } from '../utils/types'

export default function TransactionStat(props: { transaction?: Transaction }) {
  const { transaction } = props
  const status = useMemo(
    () =>
      transaction
        ? typeof transaction.status === 'string'
          ? transaction.status
          : Object.keys(transaction.status)[0]
        : '-',
    [transaction],
  )

  return (
    <>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
          whiteSpace="nowrap"
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Height</StatLabel>
              <Skeleton isLoaded={!!transaction}>
                <StatNumber>#{transaction?.block_number}</StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Status</StatLabel>
              <Skeleton isLoaded={!!transaction}>
                <StatNumber color={status === 'Executed' ? 'green.500' : 'red.500'}>
                  {status}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Gas used</StatLabel>
              <Skeleton isLoaded={!!transaction}>
                <StatNumber>
                  {transaction ? formatNumber(transaction.gas_used as bigint) : '-'}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem colSpan={1}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={6}
          paddingX={{ base: 0, md: 6 }}
        >
          <GridItem colSpan={1}>
            <Stat>
              <StatLabel>Payload</StatLabel>
              <Skeleton isLoaded={!!transaction}>
                <StatNumber>
                  {transaction && 'user_transaction' in transaction
                    ? Object.keys(
                        encoding.decodeTransactionPayload(
                          transaction.user_transaction.raw_txn.payload,
                        ),
                      )[0]
                    : 'No payload'}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
          <GridItem colSpan={2}>
            <Stat>
              <StatLabel>Timestamp</StatLabel>
              <Skeleton isLoaded={!!transaction}>
                <StatNumber>
                  {transaction ? formatTime(transaction.timestamp as number) : '-'}
                </StatNumber>
              </Skeleton>
            </Stat>
          </GridItem>
        </Grid>
      </GridItem>
    </>
  )
}
