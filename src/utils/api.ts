import type { Long, Binary } from 'bson'
import { hexlify } from './encoding'

export function mapper<T extends { _id: Binary; height: Long; author?: Binary; sender?: Binary }>(
  datum: T,
) {
  return {
    _id: hexlify(datum._id.buffer),
    height: datum.height.toString(),
    author: datum.author ? hexlify(datum.author.buffer) : undefined,
    sender: datum.sender ? hexlify(datum.sender.buffer) : undefined,
  }
}
