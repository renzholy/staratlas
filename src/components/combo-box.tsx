/* eslint-disable react/jsx-props-no-spreading */

import { List, Box, useColorModeValue } from '@chakra-ui/react'
import { ChangeEvent, ReactNode, Ref, useMemo } from 'react'
import { useCombobox, UseComboboxProps } from 'downshift'

export default function ComboBox<T>(props: {
  items: T[]
  value: string
  onChange(value: string): void
  renderInput(inputProps: { ref: Ref<HTMLInputElement> }): ReactNode
  renderItem(item: T, itemProps: {}, isHighlighted?: boolean): ReactNode
  onSelectItem(item: T): void
}) {
  const { onSelectItem, onChange } = props
  const options = useMemo<UseComboboxProps<T>>(
    () => ({
      items: props.items,
      inputValue: props.value,
      onSelectedItemChange(item) {
        if (item.selectedItem) {
          onSelectItem(item.selectedItem)
          onChange('')
        }
      },
    }),
    [props.items, props.value, onSelectItem, onChange],
  )
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox(options)
  const backgroud = useColorModeValue('white', 'gray.800')
  const boxShadow = useColorModeValue('md', 'dark-lg')

  return (
    <Box position="relative" flex={1} {...getComboboxProps()}>
      <Box {...getToggleButtonProps()}>
        {props.renderInput(
          getInputProps({
            // https://github.com/downshift-js/downshift/issues/1108#issuecomment-674180157
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.value !== props.value) {
                props.onChange(e.target.value)
              }
            },
          }),
        )}
      </Box>
      <List
        {...getMenuProps()}
        position="absolute"
        display={isOpen && props.items.length ? 'unset' : 'none'}
        maxHeight="md"
        width="100%"
        overflowY="auto"
        zIndex={10}
        borderRadius="md"
        bg={backgroud}
        boxShadow={boxShadow}
        mt={2}
        paddingY={2}
      >
        {isOpen
          ? props.items.map((item, index) =>
              props.renderItem(item, getItemProps({ item, index }), index === highlightedIndex),
            )
          : null}
      </List>
    </Box>
  )
}
