import { Button, useToast } from '@chakra-ui/react'
import copy from 'copy-to-clipboard'
import { css } from '@emotion/react'

export default function CopyLink(props: { children: string }) {
  const toast = useToast()

  return (
    <Button
      variant="link"
      color="gray.500"
      onClick={() => {
        copy(props.children)
        toast({
          title: 'Copied to clipboard',
          description: props.children,
          status: 'success',
          duration: 1000,
        })
      }}
      css={css`
        text-decoration: none !important;
      `}
    >
      {props.children}
    </Button>
  )
}
