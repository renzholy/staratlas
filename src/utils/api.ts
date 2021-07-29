import { Decimal128, Binary } from 'bson'
import { hexlify } from './encoding'

export type Type = 'block' | 'transaction' | 'uncle'

export function mapper<
  T extends { _id: Binary; height: Decimal128; author?: Binary; sender?: Binary },
>(datum: T) {
  return {
    _id: hexlify(datum._id.buffer),
    height: datum.height.toString(),
    author: datum.author ? hexlify(datum.author.buffer) : undefined,
    sender: datum.sender ? hexlify(datum.sender.buffer) : undefined,
  }
}
