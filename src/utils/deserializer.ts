import { types, serde } from '@starcoin/starcoin'
import { hexlify } from 'ethers/lib/utils'

import { formatNumber } from './formatter'

export function deserializeTypeTag(
  typeTag: types.TypeTag,
  deserializer: serde.Deserializer,
): string | undefined {
  try {
    if (typeof typeTag === 'string') {
      switch (typeTag) {
        case 'Signer':
        case 'Address': {
          return hexlify(deserializer.deserializeBytes())
        }
        case 'Bool': {
          return deserializer.deserializeBool() ? 'true' : 'false'
        }
        case 'U128': {
          return formatNumber(deserializer.deserializeU128() as bigint)
        }
        case 'U64': {
          return formatNumber(deserializer.deserializeU64() as bigint)
        }
        case 'U8': {
          return formatNumber(deserializer.deserializeU8())
        }
        default: {
          return undefined
        }
      }
    }
    if ('Vector' in typeTag) {
      const length = deserializer.deserializeLen()
      return `[${Array.from({ length })
        .map(() => deserializeTypeTag(typeTag.Vector, deserializer))
        .join(', ')}]`
    }
    if ('Struct' in typeTag) {
      return `${typeTag.Struct.address}::${typeTag.Struct.module}::${typeTag.Struct.name}<${
        typeTag.Struct.type_params
          ?.map((param) => deserializeTypeTag(param, deserializer))
          .join(', ') || ''
      }>`
    }
    return undefined
  } catch {
    return undefined
  }
}
