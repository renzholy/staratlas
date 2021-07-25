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
import { encoding, types } from '@starcoin/starcoin'
import { useMemo, useEffect } from 'react'

import useDryRunRaw from '../hooks/use-dry-run-raw'
import JsonCode from './json-code'

export default function DryRunModal(props: { userTransaction: types.SignedUserTransactionView }) {
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
  const payload = useMemo(
    () => encoding.decodeTransactionPayload(userTransaction.raw_txn.payload),
    [userTransaction],
  )
  const handleDryRunRaw = useDryRunRaw(
    senderPublicKey,
    userTransaction.raw_txn.sender,
    payload,
    userTransaction.raw_txn.max_gas_amount,
    userTransaction.raw_txn.expiration_timestamp_secs,
    userTransaction.raw_txn.chain_id,
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
      {userTransaction.raw_txn.payload ? (
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
