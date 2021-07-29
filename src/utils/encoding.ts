export function arrayify(hex: string): Uint8Array {
  return Buffer.from(hex.replace(/^0x/, ''), 'hex')
}

export function hexlify(bytes: Uint8Array): string {
  return `0x${Buffer.from(bytes).toString('hex')}`
}
