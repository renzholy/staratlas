import { ReactNode, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
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
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { ChevronDownIcon, ChevronUpIcon, MoonIcon, StarIcon, SunIcon } from '@chakra-ui/icons'
import startCase from 'lodash/startCase'

import { NETWORKS } from '../constants'
import { NetworkProvider } from '../contexts/network'
import SearchBar from '../components/search-bar'

const networks = Object.values(NETWORKS)

export default function Layout(props: { children?: ReactNode }) {
  const location = useLocation()
  const params = useParams<{ network: string }>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const buttonBackground = useColorModeValue('white', undefined)
  const boxShadow = useColorModeValue('md', 'dark-lg')
  const color = useMemo(
    () =>
      ({
        address: 'green',
        tx: 'orange',
        block: 'blue',
        uncle: 'purple',
      }[location.pathname.split('/')[2]] || 'gray'),
    [location.pathname],
  )

  return (
    <NetworkProvider value={params.network}>
      <Flex
        height={16}
        paddingX={6}
        alignItems="center"
        bg={colorMode === 'light' ? `${color}.200` : `${color}.900`}
        zIndex={1}
        boxShadow={boxShadow}
        css={css`
          position: sticky;
          top: 0;
        `}
      >
        <IconButton
          as={Link}
          to={`/${params.network}`}
          aria-label="index"
          icon={<StarIcon />}
          bg={buttonBackground}
          variant="solid"
          mr={4}
          display={{ base: 'inline-flex', md: 'none' }}
        />
        <Button
          as={Link}
          to={`/${params.network}`}
          bg={location.pathname === `/${params.network}` ? buttonBackground : undefined}
          variant={location.pathname === `/${params.network}` ? 'solid' : 'ghost'}
          mr={2}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          StarAtlas
        </Button>
        <Button
          as={Link}
          to={`/${params.network}/blocks`}
          bg={/\/blocks/.test(location.pathname) ? buttonBackground : undefined}
          variant={/\/blocks/.test(location.pathname) ? 'solid' : 'ghost'}
          mr={2}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Blocks
        </Button>
        <Button
          as={Link}
          to={`/${params.network}/txs`}
          bg={/\/txs/.test(location.pathname) ? buttonBackground : undefined}
          variant={/\/txs/.test(location.pathname) ? 'solid' : 'ghost'}
          mr={4}
          display={{ base: 'none', md: 'inline-flex' }}
        >
          Transactions
        </Button>
        <SearchBar />
        <Menu isOpen={isOpen} onClose={onClose} autoSelect={false}>
          <MenuButton
            as={Button}
            ml={4}
            bg={buttonBackground}
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onOpen}
          >
            {startCase(params.network)}
          </MenuButton>
          <Portal>
            <MenuList>
              {networks.map((network) => (
                <MenuItemOption
                  as={Link}
                  to={`/${network}`}
                  key={network}
                  isChecked={params.network === network}
                >
                  {startCase(network)}
                </MenuItemOption>
              ))}
            </MenuList>
          </Portal>
        </Menu>
        <IconButton
          aria-label="toggle color mode"
          ml={4}
          bg={buttonBackground}
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          display={{ base: 'none', md: 'inline-flex' }}
        />
      </Flex>
      {props.children}
    </NetworkProvider>
  )
}
