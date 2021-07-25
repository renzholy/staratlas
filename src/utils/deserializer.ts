import { bcs, starcoin_types, types, encoding } from '@starcoin/starcoin'

export function deserializeTypeTag(typeTag: types.TypeTag, data: Uint8Array) {
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
  // if ('Vector' in typeTag) {
  //   return deserializeTypeTag(
  //     new starcoin_types.TypeTagVariantVector(encoding.typeTagToSCS(typeTag.Vector)),
  //     tag,
  //   )
  // }
  // if ('Struct' in typeTag) {
  //   return new starcoin_types.TypeTagVariantStruct(encoding.structTagToSCS(typeTag.Struct))
  // }
  return undefined
}
