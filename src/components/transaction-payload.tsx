/* eslint-disable react/no-array-index-key */

import { Divider, Heading, Text } from '@chakra-ui/react'
import { bcs, types } from '@starcoin/starcoin'
import { Fragment, useCallback, useMemo } from 'react'
import { arrayify } from 'utils/encoding'
import { useResolveFunction } from 'hooks/use-contract'
import { formatArgsWithTypeTag } from 'utils/formatter'

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
        {functionId ? <Text color="gray.500">{functionId}</Text> : null}
        {scriptFunction.ty_args.length ? (
          <>
            <Heading size="sm" mt={4}>
              Type args
            </Heading>
            {scriptFunction.ty_args.map((arg, index) => (
              <Fragment key={`${types.formatTypeTag(arg)}${index}`}>
                {index === 0 ? null : <Divider />}
                <Text color="gray.500">{types.formatTypeTag(arg)}</Text>
              </Fragment>
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
                {index === 0 ? null : <Divider />}
                <Text color="gray.500">
                  {resolvedFunction?.args[index + 1]
                    ? `${types.formatTypeTag(resolvedFunction.args[index + 1].type_tag)}: ${
                        formatArgsWithTypeTag(
                          new bcs.BcsDeserializer(arrayify(arg)),
                          resolvedFunction.args[index + 1].type_tag,
                        ) || arg
                      }`
                    : arg}
                </Text>
              </Fragment>
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
          <Text color="gray.500">{payload.Package.package_address}</Text>
          <Heading size="sm" mt={4}>
            Code
          </Heading>
          {payload.Package.modules.map((module, index) => (
            <Fragment key={module.code}>
              {index === 0 ? null : <Divider marginY={1} />}
              <Text color="gray.500">{module.code}</Text>
            </Fragment>
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
