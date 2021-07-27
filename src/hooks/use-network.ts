import { useRouter } from 'next/router'
import { Network } from 'utils/types'

export default function useNetwork() {
  const router = useRouter()
  const { network } = router.query as { network?: Network }
  return network || 'main'
}
