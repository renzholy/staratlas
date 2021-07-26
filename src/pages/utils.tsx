import { Box, Grid, GridItem, Textarea } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { encoding } from '@starcoin/starcoin'
import { useMemo, useState } from 'react'

import TransactionPayload from '../components/transaction-payload'
import { CardWithHeader } from '../layouts/card-with-header'

export default function Utils() {
  const [text, setText] = useState('')
  const payload = useMemo(() => {
    try {
      return encoding.decodeTransactionPayload(text)
    } catch {
      return undefined
    }
  }, [text])

  return (
    <Grid
      templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) minmax(0, 1fr)' }}
      gap={6}
      padding={6}
    >
      <GridItem colSpan={1}>
        <CardWithHeader title="Decode payload hex">
          <Box
            paddingX={6}
            paddingY={4}
            css={css`
              button {
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
            <Textarea
              mb={payload ? 4 : 0}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
              }}
            />
            {payload ? <TransactionPayload payload={payload} /> : null}
          </Box>
        </CardWithHeader>
      </GridItem>
    </Grid>
  )
}
