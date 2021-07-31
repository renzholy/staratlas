import { css } from '@emotion/react'

export const textInCardStyle = css`
  a,
  p {
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    max-width: 100%;
    display: inline-block;
    text-align: start;
    font-weight: normal;
  }
`

export const textInListItemStyle = css`
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
