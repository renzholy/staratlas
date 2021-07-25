import { bcs, starcoin_types, types, encoding } from '@starcoin/starcoin'
import { arrayify } from 'ethers/lib/utils'

export function deserializeTypeTag(typeTag: types.TypeTag, tag: string) {
  if (typeof typeTag === 'string') {
    switch (typeTag) {
      case 'Signer':
      case 'Address': {
        return tag
      }
      case 'Bool': {
        return new bcs.BcsDeserializer(arrayify(tag)).deserializeBool()
      }
      case 'U128': {
        return new bcs.BcsDeserializer(arrayify(tag)).deserializeU128()
      }
      case 'U64': {
        return new bcs.BcsDeserializer(arrayify(tag)).deserializeU64()
      }
      case 'U8': {
        return new bcs.BcsDeserializer(arrayify(tag)).deserializeU8()
      }
      default: {
        return tag
      }
    }
  }
  // if ('Vector' in typeTag) {
  //   return deserializeTypeTag(
  //     new starcoin_types.TypeTagVariantVector(encoding.typeTagToSCS(typeTag.Vector)),
  //     tag,
  //   )
  // }
  if ('Struct' in typeTag) {
    return new starcoin_types.TypeTagVariantStruct(encoding.structTagToSCS(typeTag.Struct))
  }
  return tag
}
