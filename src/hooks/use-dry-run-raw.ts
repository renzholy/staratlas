import { utils, types, starcoin_types, bcs } from '@starcoin/starcoin'
import { arrayify, hexlify } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useAsync from './use-async'
import { useProvider } from './use-provider'

function serializeRawUserTransaction(scriptFunction: starcoin_types.RawUserTransaction) {
  const se = new bcs.BcsSerializer()
  scriptFunction.serialize(se)
  return hexlify(se.getBytes())
}

export default function useDryRunRaw(
  publicKeyHex?: types.HexString,
  senderAddress?: types.HexString,
  transactionPayload?: types.TransactionPayload,
  maxGasAmount?: types.U64,
  senderSequenceNumber?: types.U64,
  expirationTimestampSecs?: types.U64,
  chainId?: types.U8,
) {
  const provider = useProvider()
  const handleDryRunRaw = useCallback(async () => {
    if (
      !publicKeyHex ||
      !senderAddress ||
      !transactionPayload ||
      !maxGasAmount ||
      !senderSequenceNumber ||
      !expirationTimestampSecs ||
      !chainId
    ) {
      return undefined
    }
    const payload =
      'ScriptFunction' in transactionPayload
        ? utils.tx.encodeScriptFunction(
            transactionPayload.ScriptFunction.func,
            transactionPayload.ScriptFunction.ty_args,
            transactionPayload.ScriptFunction.args.map((arg) => arrayify(arg)),
          )
        : 'Package' in transactionPayload
        ? utils.tx.encodePackage(
            transactionPayload.Package.package_address,
            transactionPayload.Package.modules.map(({ code }) => code),
          )
        : utils.tx.encodeTransactionScript(
            arrayify(transactionPayload.Script.code),
            transactionPayload.Script.ty_args,
            transactionPayload.Script.args,
          )
    const transactionHash = await provider.dryRunRaw(
      serializeRawUserTransaction(
        utils.tx.generateRawUserTransaction(
          senderAddress,
          payload,
          maxGasAmount,
          senderSequenceNumber,
          expirationTimestampSecs,
          chainId,
        ),
      ),
      publicKeyHex,
    )
    return transactionHash
  }, [
    publicKeyHex,
    senderAddress,
    transactionPayload,
    maxGasAmount,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId,
    provider,
  ])
  return useAsync(handleDryRunRaw)
}
