import { useMemo, useCallback } from 'react'
import useSWR, { SWRConfiguration } from 'swr'
import { providers, utils, types, bcs, encoding } from '@starcoin/starcoin'
import { arrayify, hexlify } from 'ethers/lib/utils'

import { useNetwork } from '../contexts/network'
import useAsync from './use-async'

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

export function useResources(address?: string) {
  const provider = useProvider()
  return useSWR(address ? [provider.connection.url, 'getResources', address] : null, () =>
    provider.getResources(address!),
  )
}

export function useBalances(address: string) {
  const provider = useProvider()
  return useSWR([provider.connection.url, 'getBalances', address], () =>
    provider.getBalances(address),
  )
}

export function useBlock(hash?: string) {
  const provider = useProvider()
  return useSWR(hash ? [provider.connection.url, 'getBlock', hash] : null, () =>
    provider.getBlock(hash!),
  )
}

export function useTransaction(hash?: string) {
  const provider = useProvider()
  return useSWR(hash ? [provider.connection.url, 'getTransaction', hash] : null, () =>
    provider.getTransaction(hash!),
  )
}

export function useTransactionInfo(hash?: string) {
  const provider = useProvider()
  return useSWR(hash ? [provider.connection.url, 'getTransactionInfo', hash] : null, () =>
    provider.getTransactionInfo(hash!),
  )
}

export function useEventsOfTransaction(hash?: string) {
  const provider = useProvider()
  return useSWR(hash ? [provider.connection.url, 'getEventsOfTransaction', hash] : null, () =>
    provider.getEventsOfTransaction(hash!),
  )
}

export function useDryRunRaw(
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
