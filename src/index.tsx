import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { ColorModeScript } from '@chakra-ui/react'

import App from './app'
import theme from './utils/theme'
import './index.css'

ReactDOM.render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>,
  document.getElementById('root'),
)
