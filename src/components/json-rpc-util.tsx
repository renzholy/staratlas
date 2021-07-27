import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  Textarea,
  Box,
  Alert,
  MenuItemOption,
  useColorModeValue,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { useMemo, useState, useEffect, useCallback } from 'react'

import { useNetwork } from '../contexts/network'
import useAsync from '../hooks/use-async'
import { CardWithHeader } from '../layouts/card-with-header'
import { API, call } from '../utils/json-rpc'
import JsonCode from './json-code'

export default function JsonRpcUtil() {
  const [method, setMethod] = useState<keyof typeof API>()
  const [input, setInput] = useState('')
  const placeholder = useMemo(
    () => (method ? JSON.stringify(API[method].params.items) : undefined),
    [method],
  )
  const params = useMemo(() => {
    try {
      return JSON.parse(input)
    } catch {
      return undefined
    }
  }, [input])
  const network = useNetwork()
  const handleCall = useAsync(
    useCallback(
      () => (method && params ? call(network, method, params) : undefined),
      [method, network, params],
    ),
  )
  useEffect(() => {
    setInput(method && API[method].params.items.length === 0 ? '[]' : '')
  }, [method])
  const buttonBackground = useColorModeValue('white', undefined)

  return (
    <CardWithHeader
      title="JSON RPC"
      subtitle={
        <Button
          size="sm"
          mr={-4}
          bg={buttonBackground}
          disabled={!method || !params}
          isLoading={handleCall.status === 'pending'}
          onClick={handleCall.execute}
        >
          Call
        </Button>
      }
    >
      <Box paddingX={6} paddingY={4}>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {method || 'choose a method'}
          </MenuButton>
          <MenuList maxHeight="md" overflowY="auto">
            {Object.keys(API).map((key) => (
              <MenuItemOption
                key={key}
                isChecked={method === key}
                onClick={() => setMethod(key as keyof typeof API)}
              >
                {key}
              </MenuItemOption>
            ))}
          </MenuList>
        </Menu>
        {method ? (
          <Textarea
            mt={4}
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
            }}
            css={css`
              ::placeholder {
                word-break: break-all;
              }
            `}
          />
        ) : null}
        {handleCall.value ? (
          <Box mt={4}>
            <JsonCode>{handleCall.value}</JsonCode>
          </Box>
        ) : null}
        {handleCall.error ? (
          <Alert status="error" mt={4}>
            {handleCall.error.message}
          </Alert>
        ) : null}
      </Box>
    </CardWithHeader>
  )
}
