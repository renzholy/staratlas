import { Box, Text } from '@chakra-ui/react'
import type { types } from '@starcoin/starcoin'
import { Fragment } from 'react'

import JsonCode from './json-code'

export default function ResourceCardItem(props: { resource: types.MoveStruct }) {
  return (
    <Box paddingX={6}>
      {Object.entries(props.resource).map(([key, value]) => (
        <Fragment key={key}>
          <Text color="gray.500" mt={1}>
            {key}
          </Text>
          <JsonCode>{value}</JsonCode>
        </Fragment>
      ))}
    </Box>
  )
}
