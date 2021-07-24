import { Alert, AlertIcon } from '@chakra-ui/react'

export default function NotFound() {
  return (
    <Alert status="error">
      <AlertIcon />
      Not found
    </Alert>
  )
}
