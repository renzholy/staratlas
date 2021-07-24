import { useEffect, useMemo } from 'react'
import { useMonaco } from '@monaco-editor/react'
import useSWR from 'swr'
import { Code, useColorMode } from '@chakra-ui/react'

export default function JsonCode(props: { children: object }) {
  const { colorMode } = useColorMode()
  const monaco = useMonaco()
  useEffect(() => {
    if (!monaco) {
      return
    }
    monaco.editor.setTheme(colorMode === 'light' ? 'vs' : 'vs-dark')
  }, [colorMode, monaco])
  const str = useMemo(
    () =>
      JSON.stringify(
        props.children,
        (_key, value) => (typeof value === 'bigint' ? `${value.toString()}` : value),
        2,
      ),
    [props.children],
  )
  const { data } = useSWR(monaco ? ['colorize', monaco, str] : null, () =>
    monaco!.editor.colorize(str, 'json', { tabSize: 2 }),
  )

  return (
    <Code
      dangerouslySetInnerHTML={{ __html: data || str }}
      width="100%"
      overflowX="auto"
      mt={1}
      padding={2}
      bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
    />
  )
}
