/* eslint-disable react/jsx-props-no-spreading */

import {
  InputGroup,
  InputLeftElement,
  Input,
  ListItem,
  Text,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import { Ref, useCallback, useMemo, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import ComboBox from './combo-box'
import { useNetwork } from '../contexts/network'

type Item = {
  type: 'Address' | 'Block' | 'Transaction'
  prefix: 'address' | 'block' | 'tx'
  value: string
}

export default function SearchBar() {
  const [keyword, setKeyword] = useState('')
  const data = useMemo<Item[]>(
    () =>
      /^\d+$/.test(keyword)
        ? [{ type: 'Block', prefix: 'block', value: keyword }]
        : keyword.startsWith('0x')
        ? [
            { type: 'Address', prefix: 'address', value: keyword },
            { type: 'Block', prefix: 'block', value: keyword },
            { type: 'Transaction', prefix: 'tx', value: keyword },
          ]
        : [],
    [keyword],
  )
  const network = useNetwork()
  const history = useHistory()
  const inputBackground = useColorModeValue('white', 'whiteAlpha.200')
  const itemBackground = useColorModeValue('gray.100', 'whiteAlpha.200')
  const handleRenderItem = useCallback(
    (item: Item, itemProps: {}, isHighlighted: boolean) => (
      <ListItem
        key={item.type + item.value}
        as={Link}
        to={`/${network}/${item.prefix}/${item.value}`}
        width="100%"
        display="flex"
        alignItems="center"
        paddingX={4}
        paddingY={2}
        bg={isHighlighted ? itemBackground : undefined}
        {...itemProps}
      >
        <Tag colorScheme={{ Address: 'green', Block: 'blue', Transaction: 'orange' }[item.type]}>
          {item.type}
        </Tag>
        <Text flex="1" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" ml="4">
          {item.value}
        </Text>
      </ListItem>
    ),
    [itemBackground, network],
  )
  const handleRenderInput = useCallback(
    (inputProps: { ref: Ref<HTMLInputElement> }) => (
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search hash or height"
          border="none"
          bg={inputBackground}
          {...inputProps}
        />
      </InputGroup>
    ),
    [inputBackground],
  )
  const handleSelectItem = useCallback(
    (item: Item) => {
      history.push(`/${network}/${item.prefix}/${item.value}`)
    },
    [history, network],
  )

  return (
    <ComboBox
      value={keyword}
      onChange={setKeyword}
      items={data}
      renderItem={handleRenderItem}
      renderInput={handleRenderInput}
      onSelectItem={handleSelectItem}
      clearValueOnSelect={true}
    />
  )
}
