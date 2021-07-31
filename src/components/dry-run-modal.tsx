import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Button,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { useMemo, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { useDryRunRaw } from 'hooks/use-provider'
import { Static } from '@sinclair/typebox'
import { SignedUserTransaction } from 'utils/json-rpc/chain'
import JsonCode from './json-code'

export default function DryRunModal(props: {
  userTransaction: Static<typeof SignedUserTransaction>
}) {
  const { userTransaction } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const buttonBackground = useColorModeValue('white', undefined)
  const senderPublicKey = useMemo(
    () =>
      'Ed25519' in userTransaction.authenticator
        ? userTransaction.authenticator.Ed25519.public_key
        : userTransaction.authenticator.MultiEd25519.public_key,
    [userTransaction],
  )
  const handleDryRun = useDryRunRaw(
    senderPublicKey,
    userTransaction.raw_txn.sender,
    userTransaction.raw_txn.payload,
    BigInt(userTransaction.raw_txn.max_gas_amount),
    userTransaction.raw_txn.chain_id,
  )
  const toast = useToast()
  const error = useMemo(() => {
    try {
      const matched = handleDryRun.error?.message.match(
        /processing response error \(body=(.+), error=/,
      )?.[1]
      return matched ? JSON.parse(matched) : undefined
    } catch {
      return handleDryRun.error?.message
    }
  }, [handleDryRun.error?.message])
  useEffect(() => {
    if (handleDryRun.status === 'success') {
      onOpen()
    } else if (handleDryRun.status === 'error') {
      toast({ status: 'error', title: 'Dry run error', description: error, isClosable: true })
    }
  }, [error, handleDryRun.status, onOpen, toast])

  return (
    <>
      {userTransaction.raw_txn.payload ? (
        <Button
          size="sm"
          mr={-4}
          bg={buttonBackground}
          onClick={handleDryRun.execute}
          isLoading={handleDryRun.status === 'pending'}
        >
          Dry run
        </Button>
      ) : null}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dry run result</ModalHeader>
          <ModalCloseButton />
          <PerfectScrollbar options={{ suppressScrollX: true }}>
            <JsonCode>{handleDryRun.value}</JsonCode>
          </PerfectScrollbar>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
