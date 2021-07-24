import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
} from '@chakra-ui/react'
import { bcs, serde } from '@starcoin/starcoin'
import { arrayify } from 'ethers/lib/utils'
import React, { Fragment, useMemo } from 'react'

export default function ArgDecodePopover(props: { children: string }) {
  const args = useMemo(() => {
    const deserializer = new bcs.BcsDeserializer(arrayify(props.children))
    return Object.getOwnPropertyNames(serde.BinaryDeserializer.prototype)
      .filter((key) => typeof deserializer[key as keyof typeof deserializer] === 'function')
      .filter((key) => key.startsWith('deserialize'))
      .map((key) => {
        try {
          const deserializer2 = new bcs.BcsDeserializer(arrayify(props.children))
          return {
            key,
            value: (deserializer2[key as keyof typeof deserializer2] as Function)().toString(),
          }
        } catch {
          return undefined
        }
      })
  }, [props.children])

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="link" color="gray.500">
          {props.children}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent height="md">
          <PopoverArrow />
          <PopoverBody overflowY="auto">
            {args.map((arg, index) =>
              arg ? (
                <Fragment key={arg.key}>
                  <Text mt={index ? 4 : 0}>{arg.key.replace('deserialize', '')}:</Text>
                  <Text color="gray.500">{arg.value}</Text>
                </Fragment>
              ) : null,
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
