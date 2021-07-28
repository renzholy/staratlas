import { ReactNode, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  Portal,
  useColorMode,
  IconButton,
  useColorModeValue,
  Input,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { HamburgerIcon, ChevronDownIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import startCase from 'lodash/startCase'
import Link from 'next/link'
import { NETWORKS } from 'utils/constants'
import dynamic from 'next/dynamic'
import useNetwork from 'hooks/use-network'

const SearchBar = dynamic(() => import('components/search-bar'), {
  ssr: false,
  loading: () => <Input flex={1} width={0} />,
})

const networks = Object.values(NETWORKS)

export default function Layout(props: { children?: ReactNode }) {
  const router = useRouter()
  const network = useNetwork()
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
      }[router.asPath.split('/')[2]] || 'gray'),
    [router.asPath],
  )

  return (
    <>
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
        <Menu autoSelect={false}>
          <MenuButton
            as={IconButton}
            mr={4}
            bg={buttonBackground}
            icon={<HamburgerIcon />}
            display={{ base: 'inline-flex', xl: 'none' }}
          />
          <Portal>
            <MenuList>
              <Link href={`/${network}`} passHref={true}>
                <MenuItemOption as="a" isChecked={router.asPath === `/${network}`}>
                  Homepage
                </MenuItemOption>
              </Link>
              <Link href={`/${network}/blocks`} passHref={true}>
                <MenuItemOption as="a" isChecked={/\/blocks/.test(router.asPath)}>
                  Blocks
                </MenuItemOption>
              </Link>
              <Link href={`/${network}/txs`} passHref={true}>
                <MenuItemOption as="a" isChecked={/\/txs/.test(router.asPath)}>
                  Transactions
                </MenuItemOption>
              </Link>
              <Link href={`/${network}/uncles`} passHref={true}>
                <MenuItemOption as="a" isChecked={/\/uncles/.test(router.asPath)}>
                  Uncles
                </MenuItemOption>
              </Link>
              <Link href={`/${network}/tools`} passHref={true}>
                <MenuItemOption as="a" isChecked={/\/tools/.test(router.asPath)}>
                  Tools
                </MenuItemOption>
              </Link>
            </MenuList>
          </Portal>
        </Menu>
        <Link href={`/${network}`} passHref={true}>
          <Button
            as="a"
            bg={router.asPath === `/${network}` ? buttonBackground : undefined}
            variant={router.asPath === `/${network}` ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            StarAtlas
          </Button>
        </Link>
        <Link href={`/${network}/blocks`} passHref={true}>
          <Button
            as="a"
            bg={/\/blocks/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/blocks/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            Blocks
          </Button>
        </Link>
        <Link href={`/${network}/txs`} passHref={true}>
          <Button
            as="a"
            bg={/\/txs/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/txs/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            Transactions
          </Button>
        </Link>
        <Link href={`/${network}/uncles`} passHref={true}>
          <Button
            as="a"
            bg={/\/uncles/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/uncles/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            Uncles
          </Button>
        </Link>
        <Link href={`/${network}/tools`} passHref={true}>
          <Button
            as="a"
            bg={/\/tools/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/tools/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={4}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            Tools
          </Button>
        </Link>
        <SearchBar />
        <Menu autoSelect={false}>
          <MenuButton as={Button} ml={4} bg={buttonBackground} rightIcon={<ChevronDownIcon />}>
            {startCase(network)}
          </MenuButton>
          <Portal>
            <MenuList>
              {networks.map((n) => (
                <Link
                  key={n}
                  href={
                    router.asPath.split('/').length === 3
                      ? `/${n}/${router.asPath.split('/')[2]}`
                      : `/${n}`
                  }
                  passHref={true}
                >
                  <MenuItemOption as="a" isChecked={n === network}>
                    {startCase(n)}
                  </MenuItemOption>
                </Link>
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
          display={{ base: 'none', xl: 'inline-flex' }}
        />
      </Flex>
      {props.children}
    </>
  )
}
