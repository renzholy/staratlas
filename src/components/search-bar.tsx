/* eslint-disable react/jsx-props-no-spreading */

import {
  InputGroup,
  InputLeftElement,
  Input,
  ListItem,
  Text,
  Tag,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import { Ref, useCallback, useEffect, useMemo, useState } from 'react'
import compact from 'lodash/compact'
import useNetwork from 'hooks/use-network'
import { useResources } from 'hooks/use-provider'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useBlockByHash, useTransactionByHash, useUncleByHash } from 'hooks/use-api'
import ComboBox from './combo-box'

type Item = {
  type: 'Address' | 'Block' | 'Transaction' | 'Uncle'
  prefix: 'address' | 'block' | 'tx' | 'uncle'
  value: string
}

export default function SearchBar() {
  const [keyword, setKeyword] = useState('')
  const trimedKeyword = keyword.trim().toLowerCase()
  const isHash = trimedKeyword.startsWith('0x')
  const isHeight = /^\d+$/.test(trimedKeyword)
  const { data: address, isValidating: addressValidating } = useResources(
    isHash ? trimedKeyword : undefined,
  )
  const { data: block, isValidating: blockValidating } = useBlockByHash(
    isHash || isHeight ? trimedKeyword : undefined,
  )
  const { data: transaction, isValidating: transactionValidating } = useTransactionByHash(
    isHash ? trimedKeyword : undefined,
  )
  const { data: uncle, isValidating: uncleValidating } = useUncleByHash(
    isHash || isHeight ? trimedKeyword : undefined,
  )
  const data = useMemo<Item[]>(
    () =>
      compact([
        address ? { type: 'Address', prefix: 'address', value: trimedKeyword } : undefined,
        block ? { type: 'Block', prefix: 'block', value: trimedKeyword } : undefined,
        transaction ? { type: 'Transaction', prefix: 'tx', value: trimedKeyword } : undefined,
        uncle ? { type: 'Uncle', prefix: 'uncle', value: trimedKeyword } : undefined,
      ]),
    [address, block, transaction, trimedKeyword, uncle],
  )
  const isLoading = useMemo(
    () =>
      trimedKeyword &&
      (addressValidating || blockValidating || transactionValidating || uncleValidating),
    [addressValidating, blockValidating, transactionValidating, trimedKeyword, uncleValidating],
  )
  const network = useNetwork()
  const router = useRouter()
  const inputBackground = useColorModeValue('white', 'whiteAlpha.200')
  const itemBackground = useColorModeValue('gray.100', 'whiteAlpha.200')
  const handleRenderItem = useCallback(
    (item: Item, itemProps: {}, isHighlighted: boolean) => (
      <Link
        key={item.type + item.value}
        href={`/${network}/${item.prefix}/${item.value}`}
        passHref={true}
      >
        <ListItem
          as="a"
          width="100%"
          display="flex"
          alignItems="center"
          paddingX={4}
          paddingY={2}
          bg={isHighlighted ? itemBackground : undefined}
          {...itemProps}
        >
          <Tag
            colorScheme={
              { Address: 'green', Block: 'blue', Transaction: 'orange', Uncle: 'purple' }[item.type]
            }
          >
            {item.type}
          </Tag>
          <Text flex="1" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" ml="4">
            {item.value}
          </Text>
        </ListItem>
      </Link>
    ),
    [itemBackground, network],
  )
  const handleRenderInput = useCallback(
    (inputProps: { ref: Ref<HTMLInputElement> }) => (
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          {isLoading ? <Spinner size="sm" /> : <Search2Icon color="gray.300" />}
        </InputLeftElement>
        <Input
          placeholder="Search hash or height"
          border="none"
          bg={inputBackground}
          {...inputProps}
        />
      </InputGroup>
    ),
    [inputBackground, isLoading],
  )
  const handleSelectItem = useCallback(
    (item: Item) => {
      router.push(`/${network}/${item.prefix}/${item.value}`)
    },
    [router, network],
  )
  useEffect(() => {
    setKeyword('')
  }, [router.asPath])

  return (
    <ComboBox
      value={keyword}
      onChange={setKeyword}
      items={data}
      renderItem={handleRenderItem}
      renderInput={handleRenderInput}
      onSelectItem={handleSelectItem}
    />
  )
}
