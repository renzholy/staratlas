import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'

import Layout from './layouts/layout'
import Block from './pages/block'
import Blocks from './pages/blocks'
import Index from './pages/index'
import Transaction from './pages/transaction'
import Transactions from './pages/transactions'
import Redirect from './pages/redirect'
import Address from './pages/address'
import theme from './utils/theme'
import Uncle from './pages/uncle'

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Route path="/:network">
          <Layout>
            <Switch>
              <Route path="/:network/block/:hashOrHeight">
                <Block />
              </Route>
              <Route path="/:network/uncle/:hash">
                <Uncle />
              </Route>
              <Route path="/:network/blocks">
                <Blocks />
              </Route>
              <Route path="/:network/tx/:hash">
                <Transaction />
              </Route>
              <Route path="/:network/txs">
                <Transactions />
              </Route>
              <Route path="/:network/address/:hash">
                <Address />
              </Route>
              <Route path="/:network">
                <Index />
              </Route>
            </Switch>
          </Layout>
        </Route>
        <Route path="/" exact>
          <Redirect />
        </Route>
      </BrowserRouter>
    </ChakraProvider>
  )
}
