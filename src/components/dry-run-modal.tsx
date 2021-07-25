import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo, useEffect } from 'react'

import useDryRunRaw from '../hooks/use-dry-run-raw'
import { Transaction } from '../utils/types'
import JsonCode from './json-code'

export default function DryRunModal(props: { transaction: Transaction }) {
  const { transaction } = props
  const { isOpen, onOpen, onClose } = useDisclosure()
  const buttonBackground = useColorModeValue('white', undefined)
  const senderPublicKey = useMemo(
    () =>
      transaction
        ? 'user_transaction' in transaction
          ? 'Ed25519' in transaction.user_transaction.authenticator
            ? transaction.user_transaction.authenticator.Ed25519.public_key
            : transaction.user_transaction.authenticator.MultiEd25519.public_key
          : transaction.block_metadata.author_auth_key
        : undefined,
    [transaction],
  )
  const handleDryRunRaw = useDryRunRaw(
    senderPublicKey,
    transaction && 'user_transaction' in transaction
      ? transaction.user_transaction.raw_txn.payload
      : undefined,
  )
  useEffect(() => {
    if (handleDryRunRaw.status === 'success') {
      onOpen()
    }
  }, [handleDryRunRaw.status, onOpen])
  useEffect(() => {
    if (handleDryRunRaw.status === 'error') {
      onOpen()
    }
  }, [handleDryRunRaw.status, onOpen])
  const error = useMemo(() => {
    const matched = handleDryRunRaw.error?.message.match(
      /processing response error \(body=(.+), error=/,
    )?.[1]
    return matched ? JSON.parse(JSON.parse(matched)) : undefined
  }, [handleDryRunRaw.error?.message])

  return (
    <>
      {transaction &&
      'user_transaction' in transaction &&
      transaction.user_transaction.raw_txn.payload ? (
        <Button
          size="sm"
          mr={-4}
          bg={buttonBackground}
          onClick={handleDryRunRaw.execute}
          isLoading={handleDryRunRaw.status === 'pending'}
        >
          Dry run
        </Button>
      ) : null}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dry run result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <JsonCode>{error || handleDryRunRaw.value}</JsonCode>
          </ModalBody>
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
