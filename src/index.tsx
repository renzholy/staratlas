import React from 'react'
import ReactDOM from 'react-dom'
import { ColorModeScript } from '@chakra-ui/react'

import App from './app'
import './index.css'
import theme from './utils/theme'

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
