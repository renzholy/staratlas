import { Text } from '@chakra-ui/react'
import type { types } from '@starcoin/starcoin'
import { Fragment } from 'react'

import JsonCode from './json-code'

export default function ResourceListItem(props: { resource: types.MoveStruct }) {
  return (
    <>
      {Object.entries(props.resource).map(([key, value]) => (
        <Fragment key={key}>
          <Text color="gray.500">{key}</Text>
          <JsonCode>{value}</JsonCode>
        </Fragment>
      ))}
    </>
  )
}
