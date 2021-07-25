import { utils, types, starcoin_types, bcs, encoding } from '@starcoin/starcoin'
import { arrayify, hexlify } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useAsync from './use-async'
import { useProvider } from './use-provider'

function serializeRawUserTransaction(scriptFunction: starcoin_types.RawUserTransaction) {
  const se = new bcs.BcsSerializer()
  scriptFunction.serialize(se)
  return hexlify(se.getBytes())
}

export default function useDryRun(
  publicKeyHex?: types.HexString,
  senderAddress?: types.HexString,
  transactionPayload?: types.HexString,
  maxGasAmount?: types.U64,
  chainId?: types.U8,
) {
  const provider = useProvider()
  const handleDryRunRaw = useCallback(async () => {
    if (!publicKeyHex || !senderAddress || !transactionPayload || !maxGasAmount || !chainId) {
      return undefined
    }
    const senderSequenceNumber = await provider.getSequenceNumber(senderAddress)
    if (!senderSequenceNumber) {
      return undefined
    }
    const decodedPayload = encoding.decodeTransactionPayload(transactionPayload)
    const payload =
      'ScriptFunction' in decodedPayload
        ? utils.tx.encodeScriptFunction(
            decodedPayload.ScriptFunction.func,
            decodedPayload.ScriptFunction.ty_args,
            decodedPayload.ScriptFunction.args.map((arg) => arrayify(arg)),
          )
        : 'Package' in decodedPayload
        ? utils.tx.encodePackage(
            decodedPayload.Package.package_address,
            decodedPayload.Package.modules.map(({ code }) => code),
            decodedPayload.Package.init_script
              ? {
                  functionId: decodedPayload.Package.init_script?.func,
                  tyArgs: decodedPayload.Package.init_script.ty_args,
                  args: decodedPayload.Package.init_script.args.map((arg) => arrayify(arg)),
                }
              : undefined,
          )
        : utils.tx.encodeTransactionScript(
            arrayify(decodedPayload.Script.code),
            decodedPayload.Script.ty_args,
            decodedPayload.Script.args,
          )
    const rawUserTransactionHex = serializeRawUserTransaction(
      utils.tx.generateRawUserTransaction(
        senderAddress,
        payload,
        maxGasAmount,
        senderSequenceNumber,
        Math.round(Date.now() / 1000) + 60,
        chainId,
      ),
    )
    return provider.dryRunRaw(rawUserTransactionHex, publicKeyHex)
  }, [publicKeyHex, senderAddress, transactionPayload, maxGasAmount, chainId, provider])
  return useAsync(handleDryRunRaw)
}
