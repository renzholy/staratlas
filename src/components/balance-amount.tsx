import { Text } from '@chakra-ui/react'
import { useScalingFactor } from 'hooks/use-contract'
import { useMemo } from 'react'

function formatAmount(value: string, factor: number) {
  if (factor >= value.length) {
    return `0.${value.padStart(factor, '0')}`
  }
  return `${value.slice(0, value.length - factor)}.${value.slice(value.length - factor)}`
}

export default function BalanceAmount(props: { token: string; value: bigint }) {
  const { data } = useScalingFactor(props.token)
  const factor = useMemo(() => (data ? data[0].toString().length - 1 : undefined), [data])

  return <Text color="gray.500">{factor ? formatAmount(props.value.toString(), factor) : '-'}</Text>
}
