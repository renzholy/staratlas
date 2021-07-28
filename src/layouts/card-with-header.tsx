import { Flex, Divider, LayoutProps, useColorMode, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function CardWithHeader(props: {
  height?: LayoutProps['height']
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}) {
  const { colorMode } = useColorMode()

  return (
    <Flex
      borderRadius="lg"
      height={props.height}
      borderStyle="solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      borderWidth={1}
      flexDirection="column"
      overflow="hidden"
    >
      <Flex
        paddingX={6}
        height={12}
        alignItems="center"
        justifyContent="space-between"
        bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}
      >
        {typeof props.title === 'string' ? (
          <Text size="lg" fontWeight="bold">
            {props.title}
          </Text>
        ) : (
          props.title
        )}
        {props.subtitle}
      </Flex>
      <Divider />
      {props.children}
    </Flex>
  )
}
