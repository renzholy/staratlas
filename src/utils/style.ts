import { css } from '@emotion/react'

export const textClass = css`
  button,
  a,
  p {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    display: inline-block;
    text-align: start;
    vertical-align: text-bottom;
    font-weight: normal;
  }
`
