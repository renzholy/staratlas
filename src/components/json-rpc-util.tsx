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
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { useMemo, useState, useEffect } from 'react'

import useAsync from '../hooks/use-async'
import { useJsonRpcCall } from '../hooks/use-json-rpc'
import { CardWithHeader } from '../layouts/card-with-header'
import API from '../utils/json-rpc'
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
  const handleJsonRpcCall = useAsync(useJsonRpcCall(method, params))
  useEffect(() => {
    setInput(method && API[method].params.items.length === 0 ? '[]' : '')
  }, [method])

  return (
    <CardWithHeader
      title="JSON RPC"
      subtitle={
        <Button
          size="sm"
          mr={-4}
          disabled={!method || !params}
          isLoading={handleJsonRpcCall.status === 'pending'}
          onClick={handleJsonRpcCall.execute}
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
        {handleJsonRpcCall.value ? (
          <Box mt={4}>
            <JsonCode>{handleJsonRpcCall.value}</JsonCode>
          </Box>
        ) : null}
        {handleJsonRpcCall.error ? (
          <Alert status="error" mt={4}>
            {handleJsonRpcCall.error.message}
          </Alert>
        ) : null}
      </Box>
    </CardWithHeader>
  )
}
