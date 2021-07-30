import { useMemo, useCallback } from 'react'
import useSWR, { SWRConfiguration } from 'swr'
import { providers, utils, bcs, encoding, types } from '@starcoin/starcoin'
import { arrayify, hexlify } from 'utils/encoding'
import useAsync from './use-async'
import useNetwork from './use-network'

export function useProvider() {
  const network = useNetwork()
  return useMemo(
    () => new providers.JsonRpcProvider(`https://${network}-seed.starcoin.org`),
    [network],
  )
}

export function useResource(address: string, resource: string, config?: SWRConfiguration) {
  const provider = useProvider()
  return useSWR(
    [provider.connection.url, 'getResource', address, resource],
    async () => provider.getResource(address, resource),
    config,
  )
}

export function useResources(address?: string, config?: SWRConfiguration) {
  const provider = useProvider()
  return useSWR<
    | {
        [k: string]: types.MoveStruct
      }
    | undefined
  >(
    address ? [provider.connection.url, 'getResources', address] : null,
    () => provider.getResources(address!),
    config,
  )
}

export function useBalances(address?: string) {
  const provider = useProvider()
  return useSWR(address ? [provider.connection.url, 'getBalances', address] : null, () =>
    provider.getBalances(address!),
  )
}

export function useDryRunRaw(
  publicKeyHex?: string,
  senderAddress?: string,
  transactionPayload?: string,
  maxGasAmount?: bigint,
  chainId?: number,
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
    const rawUserTransaction = utils.tx.generateRawUserTransaction(
      senderAddress,
      payload,
      maxGasAmount,
      senderSequenceNumber,
      Math.round(Date.now() / 1000) + 60,
      chainId,
    )
    const se = new bcs.BcsSerializer()
    rawUserTransaction.serialize(se)
    const rawUserTransactionHex = hexlify(se.getBytes())
    return provider.dryRunRaw(rawUserTransactionHex, publicKeyHex)
  }, [publicKeyHex, senderAddress, transactionPayload, maxGasAmount, chainId, provider])
  return useAsync(handleDryRunRaw)
}
