import {
  ChakraProvider,
  cookieStorageManager,
  localStorageManager,
  StorageManager,
} from '@chakra-ui/react'
import type { GetServerSidePropsContext } from 'next'
import type { ReactNode } from 'react'

export default function Chakra(props: { cookies: StorageManager; children: ReactNode }) {
  const colorModeManager =
    typeof props.cookies === 'string' ? cookieStorageManager(props.cookies) : localStorageManager

  return <ChakraProvider colorModeManager={colorModeManager}>{props.children}</ChakraProvider>
}

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  }
}
