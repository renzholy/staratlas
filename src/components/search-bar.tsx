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
import useJsonRpc from 'hooks/use-json-rpc'
import flatMap from 'lodash/flatMap'
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
  const { data: block, isValidating: blockValidating } = useJsonRpc(
    isHash ? 'chain.get_block_by_hash' : isHeight ? 'chain.get_block_by_number' : undefined,
    trimedKeyword
      ? isHash
        ? [trimedKeyword]
        : isHeight
        ? [parseInt(trimedKeyword, 10)]
        : undefined
      : undefined,
  )
  const { data: blocks } = useJsonRpc(
    'chain.get_epoch_uncles_by_number',
    isHeight && trimedKeyword
      ? [parseInt(trimedKeyword, 10)]
      : block
      ? [parseInt(block.header.number, 10)]
      : undefined,
  )
  const uncles = useMemo(() => (blocks ? flatMap(blocks, (b) => b.uncles) : undefined), [blocks])
  const { data: transaction, isValidating: transactionValidating } = useJsonRpc(
    'chain.get_transaction',
    isHash ? [trimedKeyword] : undefined,
  )
  const isLoading = useMemo(
    () => trimedKeyword && (addressValidating || blockValidating || transactionValidating),
    [addressValidating, blockValidating, transactionValidating, trimedKeyword],
  )
  const data = useMemo<Item[]>(
    () =>
      trimedKeyword
        ? compact([
            address ? { type: 'Address', prefix: 'address', value: trimedKeyword } : undefined,
            block && !uncles?.find((uncle) => uncle.block_hash === block.header.block_hash)
              ? { type: 'Block', prefix: 'block', value: block.header.block_hash }
              : undefined,
            transaction
              ? { type: 'Transaction', prefix: 'tx', value: transaction.transaction_hash }
              : undefined,
            ...(uncles
              ?.filter(
                (uncle) => uncle.block_hash === trimedKeyword || uncle.number === trimedKeyword,
              )
              .map<Item>((uncle) => ({
                type: 'Uncle',
                prefix: 'uncle',
                value: uncle.block_hash,
              })) || []),
          ])
        : [],
    [address, block, transaction, trimedKeyword, uncles],
  )
  const network = useNetwork()
  const router = useRouter()
  const inputBackground = useColorModeValue('white', 'whiteAlpha.200')
  const itemBackground = useColorModeValue('gray.100', 'whiteAlpha.200')
  const handleRenderItem = useCallback(
    (item: Item, itemProps: {}, index: number, isHighlighted: boolean) => (
      <Link
        key={item.type + item.value + index}
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
          flex={1}
          width={0}
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
