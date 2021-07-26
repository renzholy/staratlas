import { Text } from '@chakra-ui/react'

import { useScalingFactor } from '../hooks/use-contract'
import { formatNumberPrecision } from '../utils/formatter'

export default function BalanceAmount(props: { token: string; value: bigint }) {
  const { data } = useScalingFactor(props.token)

  return <Text color="gray.500">{data ? formatNumberPrecision(props.value / data[0]) : '-'}</Text>
}
