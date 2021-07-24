/* eslint-disable react/no-array-index-key */

import { Heading, Text } from '@chakra-ui/react'
import { bcs, encoding, types } from '@starcoin/starcoin'
import { arrayify } from 'ethers/lib/utils'
import { useMemo, useCallback, Fragment } from 'react'

import ArgDecodePopover from './arg-decode-popover'
import CopyLink from './copy-link'

export default function TransactionPayload(props: { payload: string }) {
  const payload = useMemo(() => encoding.decodeTransactionPayload(props.payload), [props.payload])
  const type = Object.keys(payload)[0]
  const renderScriptFunction = useCallback(
    (
      scriptFunction: Extract<
        types.TransactionPayload,
        { ScriptFunction: unknown }
      >['ScriptFunction'],
    ) => (
      <>
        <CopyLink>
          {typeof scriptFunction.func === 'string'
            ? scriptFunction.func
            : `${scriptFunction.func.address}::${scriptFunction.func.module}::${scriptFunction.func.functionName}`}
        </CopyLink>
        {scriptFunction.ty_args.length ? (
          <>
            <Heading size="sm" mt={4}>
              Type args
            </Heading>
            {scriptFunction.ty_args.map((arg, index) => (
              <CopyLink key={`${types.formatTypeTag(arg)}${index}`}>
                {types.formatTypeTag(arg)}
              </CopyLink>
            ))}
          </>
        ) : null}
        {scriptFunction.args.length ? (
          <>
            <Heading size="sm" mt={4}>
              Args
            </Heading>
            {scriptFunction.args.map((arg, index) => (
              <Fragment key={`${arg}${index}`}>
                {index === 0 ? null : <br />}
                <ArgDecodePopover>{arg}</ArgDecodePopover>
              </Fragment>
            ))}
          </>
        ) : null}
      </>
    ),
    [],
  )

  return (
    <>
      <Heading size="sm">{type}</Heading>
      {'ScriptFunction' in payload ? renderScriptFunction(payload.ScriptFunction) : null}
      {'Package' in payload ? (
        <>
          <CopyLink>{payload.Package.package_address}</CopyLink>
          <Heading size="sm" mt={4}>
            Code
          </Heading>
          {payload.Package.modules.map((module) => (
            <Text key={module.code} color="gray.500">
              {new bcs.BcsDeserializer(arrayify(module.code)).deserializeStr()}
            </Text>
          ))}
          {payload.Package.init_script ? (
            <>
              <Heading size="sm" mt={4}>
                Init script
              </Heading>
              {renderScriptFunction(payload.Package.init_script)}
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}
