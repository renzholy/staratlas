import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Textarea,
  Flex,
  Box,
  Alert,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { useMemo, useState } from 'react'

import useAsync from '../hooks/use-async'
import { useJsonRpcCall } from '../hooks/use-json-rpc'
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

  return (
    <>
      <Flex justifyContent="space-between">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {method || 'choose a method'}
          </MenuButton>
          <MenuList>
            {Object.keys(API).map((key) => (
              <MenuItem key={key} onClick={() => setMethod(key as keyof typeof API)}>
                {key}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Button
          disabled={!method || !params}
          isLoading={handleJsonRpcCall.status === 'pending'}
          onClick={handleJsonRpcCall.execute}
        >
          Run
        </Button>
      </Flex>
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
    </>
  )
}
