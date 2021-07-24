import { ReactNode, useCallback } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import {
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  Portal,
  useDisclosure,
  useColorMode,
  IconButton,
  useColorModeValue,
  useBreakpoint,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { ChevronDownIcon, ChevronUpIcon, MoonIcon, StarIcon, SunIcon } from '@chakra-ui/icons'

import { NETWORKS } from '../constants'
import { NetworkProvider } from '../contexts/network'
import SearchBar from '../components/search-bar'

const networks = Object.values(NETWORKS)

export default function Layout(props: { children?: ReactNode }) {
  const history = useHistory()
  const params = useParams<{ network: string }>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const handleSelect = useCallback(
    (item: string) => {
      history.push({
        ...history.location,
        pathname: history.location.pathname.replace(/^\/\w+/, `/${item}`),
      })
    },
    [history],
  )
  const buttonBackground = useColorModeValue('white', undefined)
  const boxShadow = useColorModeValue('md', 'dark-lg')
  const breakpoint = useBreakpoint()

  return (
    <NetworkProvider value={params.network}>
      <Flex
        height={16}
        paddingX={6}
        alignItems="center"
        bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}
        zIndex={1}
        boxShadow={boxShadow}
        css={css`
          position: sticky;
          top: 0;
        `}
      >
        {breakpoint === 'md' ? (
          <IconButton aria-label="index" icon={<StarIcon />} mr={4} />
        ) : (
          <>
            <Button
              as={Link}
              to={`/${params.network}`}
              bg={history.location.pathname === `/${params.network}` ? buttonBackground : undefined}
              variant={history.location.pathname === `/${params.network}` ? 'solid' : 'ghost'}
              mr={2}
            >
              StarAtlas
            </Button>
            <Button
              as={Link}
              to={`/${params.network}/blocks`}
              bg={/\/blocks/.test(history.location.pathname) ? buttonBackground : undefined}
              variant={/\/blocks/.test(history.location.pathname) ? 'solid' : 'ghost'}
              mr={2}
            >
              Blocks
            </Button>
            <Button
              as={Link}
              to={`/${params.network}/txs`}
              bg={/\/txs/.test(history.location.pathname) ? buttonBackground : undefined}
              variant={/\/txs/.test(history.location.pathname) ? 'solid' : 'ghost'}
              mr={4}
            >
              Transactions
            </Button>
          </>
        )}
        <SearchBar />
        <Menu isOpen={isOpen} onClose={onClose} autoSelect={false}>
          <MenuButton
            as={Button}
            ml={4}
            bg={buttonBackground}
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onOpen}
          >
            {params.network}
          </MenuButton>
          <Portal>
            <MenuList>
              {networks.map((network) => (
                <MenuItemOption
                  key={network}
                  onClick={() => handleSelect(network)}
                  isChecked={params.network === network}
                >
                  {network}
                </MenuItemOption>
              ))}
            </MenuList>
          </Portal>
        </Menu>
        {breakpoint === 'md' ? null : (
          <IconButton
            aria-label="toggle color mode"
            ml={4}
            bg={buttonBackground}
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
          />
        )}
      </Flex>
      {props.children}
    </NetworkProvider>
  )
}
