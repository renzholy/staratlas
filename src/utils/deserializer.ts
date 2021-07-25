import { bcs, types } from '@starcoin/starcoin'

export function deserializeTypeTag(
  typeTag: types.TypeTag,
  data: Uint8Array,
): boolean | string | BigInt | number | undefined {
  if (typeof typeTag === 'string') {
    switch (typeTag) {
      case 'Signer':
      case 'Address': {
        return undefined
      }
      case 'Bool': {
        return new bcs.BcsDeserializer(data).deserializeBool()
      }
      case 'U128': {
        return new bcs.BcsDeserializer(data).deserializeU128()
      }
      case 'U64': {
        return new bcs.BcsDeserializer(data).deserializeU64()
      }
      case 'U8': {
        return new bcs.BcsDeserializer(data).deserializeU8()
      }
      default: {
        return undefined
      }
    }
  }
  if ('Vector' in typeTag) {
    return deserializeTypeTag(typeTag.Vector, data)
  }
  if ('Struct' in typeTag) {
    return typeTag.Struct.type_params?.map((param) => deserializeTypeTag(param, data)).join(', ')
  }
  return undefined
}
