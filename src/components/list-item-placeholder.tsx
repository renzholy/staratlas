import { Center } from '@chakra-ui/react'
import React, { ReactNode } from 'react'

export default function ListItemPlaceholder(props: { height: number; children?: ReactNode }) {
  return <Center height={`${props.height}px`}>{props.children}</Center>
}
