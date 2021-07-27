import Head from 'next/head'
import type { AppProps } from 'next/app'
import { ChakraProvider, useInterval } from '@chakra-ui/react'
import theme from 'utils/theme'
import Layout from 'layouts/layout'
import { useEffect, useState, useCallback } from 'react'
import useNetwork from 'hooks/use-network'
import './global.css'

function App({ Component, pageProps }: AppProps) {
  const network = useNetwork()
  const [worker, setWorker] = useState<Worker>()
  useEffect(() => {
    setWorker(new Worker(new URL('workers/maintain-index.worker', import.meta.url)))
  }, [network])
  const handlePostMessage = useCallback(() => {
    worker?.postMessage(network)
  }, [network, worker])
  useEffect(handlePostMessage, [handlePostMessage])
  useInterval(handlePostMessage, 2000)

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💫</text></svg>"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>StarAtlas</title>
      </Head>
      <ChakraProvider theme={theme}>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </>
  )
}

export default App
