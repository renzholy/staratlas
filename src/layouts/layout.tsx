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
  useDisclosure,
  useColorMode,
  IconButton,
  useColorModeValue,
  Input,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { ChevronDownIcon, ChevronUpIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import startCase from 'lodash/startCase'
import { AiOutlineHome, AiOutlineTool } from 'react-icons/ai'
import Link from 'next/link'
import { NETWORKS } from 'utils/constants'
import dynamic from 'next/dynamic'

const SearchBar = dynamic(() => import('components/search-bar'), {
  ssr: false,
  loading: () => <Input />,
})

const networks = Object.values(NETWORKS)

export default function Layout(props: { children?: ReactNode }) {
  const router = useRouter()
  const query = router.query as { network: 'main' | 'barnard' | 'halley' | 'proxima' }
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
        <Link href={`/${query.network}`} passHref={true}>
          <IconButton
            as="a"
            aria-label="index"
            icon={<AiOutlineHome />}
            bg={router.asPath === `/${query.network}` ? buttonBackground : undefined}
            variant={router.asPath === `/${query.network}` ? 'solid' : 'ghost'}
            mr={4}
            display={{ base: 'inline-flex', md: 'none' }}
          />
        </Link>
        <Link href={`/${query.network}`} passHref={true}>
          <Button
            as="a"
            bg={router.asPath === `/${query.network}` ? buttonBackground : undefined}
            variant={router.asPath === `/${query.network}` ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            StarAtlas
          </Button>
        </Link>
        <Link href={`/${query.network}/blocks`} passHref={true}>
          <Button
            as="a"
            bg={/\/blocks/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/blocks/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={2}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Blocks
          </Button>
        </Link>
        <Link href={`/${query.network}/txs`} passHref={true}>
          <Button
            as="a"
            bg={/\/txs/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/txs/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={4}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Transactions
          </Button>
        </Link>
        <Link href={`/${query.network}/utils`} passHref={true}>
          <IconButton
            as="a"
            aria-label="index"
            icon={<AiOutlineTool />}
            bg={/\/utils/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/utils/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={4}
            display={{ base: 'inline-flex', md: 'none' }}
          />
        </Link>
        <Link href={`/${query.network}/utils`} passHref={true}>
          <Button
            as="a"
            bg={/\/utils/.test(router.asPath) ? buttonBackground : undefined}
            variant={/\/utils/.test(router.asPath) ? 'solid' : 'ghost'}
            mr={4}
            display={{ base: 'none', md: 'inline-flex' }}
          >
            Utils
          </Button>
        </Link>
        <SearchBar />
        <Menu isOpen={isOpen} onClose={onClose} autoSelect={false}>
          <MenuButton
            as={Button}
            ml={4}
            bg={buttonBackground}
            rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onOpen}
          >
            {startCase(query.network)}
          </MenuButton>
          <Portal>
            <MenuList>
              {networks.map((network) => (
                <MenuItemOption
                  as="a"
                  href={
                    router.asPath.split('/').length === 3
                      ? `/${network}/${router.asPath.split('/')[2]}`
                      : `/${network}`
                  }
                  key={network}
                  isChecked={query.network === network}
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
    </>
  )
}
