import { types, serde } from '@starcoin/starcoin'
import { hexlify } from 'ethers/lib/utils'

export function deserializeTypeTag(
  typeTag: types.TypeTag,
  deserializer: serde.Deserializer,
): boolean | string | BigInt | number | undefined {
  if (typeof typeTag === 'string') {
    switch (typeTag) {
      case 'Signer':
      case 'Address': {
        return hexlify(deserializer.deserializeBytes())
      }
      case 'Bool': {
        return deserializer.deserializeBool()
      }
      case 'U128': {
        return deserializer.deserializeU128()
      }
      case 'U64': {
        return deserializer.deserializeU64()
      }
      case 'U8': {
        return deserializer.deserializeU8()
      }
      default: {
        throw new Error()
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
}
