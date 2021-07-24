import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { ColorModeScript } from '@chakra-ui/react'

import App from './app'
import './index.css'
import theme from './utils/theme'

ReactDOM.render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>,
  document.getElementById('root'),
)
