import dayjs from 'dayjs'
import { types, serde } from '@starcoin/starcoin'
import { hexlify } from './encoding'

export const numberFormat = Intl.NumberFormat()

export const numberFormatPrecision = Intl.NumberFormat([], { maximumFractionDigits: 17 })

export function formatNumber(value: number | bigint) {
  return numberFormat.format(value)
}

export function formatNumberPrecision(value: number | bigint) {
  return numberFormatPrecision.format(value)
}

export function formatTime(date?: dayjs.ConfigType) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatTimeSimple(date?: dayjs.ConfigType) {
  return dayjs(date).format('MM-DD HH:mm:ss')
}

export function formatArgsWithTypeTag(
  deserializer: serde.Deserializer,
  typeTag: types.TypeTag,
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
        .map(() => formatArgsWithTypeTag(deserializer, typeTag.Vector))
        .join(', ')}]`
    }
    if ('Struct' in typeTag) {
      return `${typeTag.Struct.address}::${typeTag.Struct.module}::${typeTag.Struct.name}${
        typeTag.Struct.type_params
          ? `<${typeTag.Struct.type_params
              .map((param) => formatArgsWithTypeTag(deserializer, param))
              .join(', ')}>`
          : ''
      }`
    }
    return undefined
  } catch {
    return undefined
  }
}
