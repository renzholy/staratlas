import { useRouter } from 'next/router'

export default function useNetwork() {
  const router = useRouter()
  const { network } = router.query as { network?: 'main' | 'barnard' | 'halley' | 'proxima' }
  return network || 'main'
}
