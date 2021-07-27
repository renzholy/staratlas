import { Text } from '@chakra-ui/react'

import { useScalingFactor } from 'hooks/use-contract'
import { formatNumberPrecision } from 'utils/formatter'

export default function BalanceAmount(props: { token: string; value: BigInt | number }) {
  const { data } = useScalingFactor(props.token)

  return (
    <Text color="gray.500">
      {data ? formatNumberPrecision(BigInt(props.value.toString()) / BigInt(data[0])) : '-'}
    </Text>
  )
}
