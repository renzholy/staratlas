import Head from 'next/head'
import type { AppProps } from 'next/app'
import Layout from 'layouts/layout'
import Chakra from 'layouts/chakra'
import Script from 'next/script'
import './global.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-E2LXM6218N" />
      <Script id="ga">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-E2LXM6218N');`}
      </Script>
      <Head>
        <meta charSet="UTF-8" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💫</text></svg>"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>StarAtlas</title>
      </Head>
      <Chakra cookies={pageProps.cookies}>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </Chakra>
    </>
  )
}

export default App
