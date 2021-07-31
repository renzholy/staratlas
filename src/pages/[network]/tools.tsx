import { Alert, Box, Grid, GridItem, Textarea } from '@chakra-ui/react'
import { encoding } from '@starcoin/starcoin'
import { useMemo, useState } from 'react'
import JsonRpcUtil from 'components/json-rpc-util'

import TransactionPayload from 'components/transaction-payload'
import { CardWithHeader } from 'layouts/card-with-header'
import { textClass } from 'utils/style'

export default function Tools() {
  const [text, setText] = useState('')
  const [error, setError] = useState<Error>()
  const payload = useMemo(() => {
    try {
      setError(undefined)
      return text.trim() ? encoding.decodeTransactionPayload(text.trim()) : undefined
    } catch (err) {
      setError(err)
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
          <Box paddingX={6} paddingY={4} css={textClass}>
            <Textarea
              mb={payload || error ? 4 : 0}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
              }}
            />
            {payload ? <TransactionPayload payload={payload} /> : null}
            {error ? <Alert status="error">{error.message}</Alert> : null}
          </Box>
        </CardWithHeader>
      </GridItem>
      <GridItem colSpan={1}>
        <JsonRpcUtil />
      </GridItem>
    </Grid>
  )
}

export { getServerSideProps } from 'layouts/chakra'
