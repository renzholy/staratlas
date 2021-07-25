/* eslint-disable react/no-array-index-key */

import { Heading, Text } from '@chakra-ui/react'
import { bcs, types } from '@starcoin/starcoin'
import { arrayify } from 'ethers/lib/utils'
import { useCallback, useMemo } from 'react'

import { useResolveFunction } from '../hooks/use-provider'
import { deserializeTypeTag } from '../utils/deserializer'
import CopyLink from './copy-link'

export default function TransactionPayload(props: { payload: types.TransactionPayload }) {
  const { payload } = props
  const type = Object.keys(payload)[0]
  const functionId = useMemo(
    () =>
      'ScriptFunction' in payload
        ? typeof payload.ScriptFunction.func === 'string'
          ? payload.ScriptFunction.func
          : `${payload.ScriptFunction.func.address}::${payload.ScriptFunction.func.module}::${payload.ScriptFunction.func.functionName}`
        : undefined,
    [payload],
  )
  const { data: resolvedFunction } = useResolveFunction(functionId)
  const renderScriptFunction = useCallback(
    (
      scriptFunction: Extract<
        types.TransactionPayload,
        { ScriptFunction: unknown }
      >['ScriptFunction'],
    ) => (
      <>
        <CopyLink>{functionId || ''}</CopyLink>
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
              <Text key={`${arg}${index}`} color="gray.500">
                {resolvedFunction
                  ? `${types.formatTypeTag(
                      resolvedFunction.args[index].type_tag,
                    )}: ${deserializeTypeTag(resolvedFunction.args[index].type_tag, arg)}`
                  : null}
              </Text>
            ))}
          </>
        ) : null}
      </>
    ),
    [functionId, resolvedFunction],
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
