import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NETWORKS } from 'utils/constants'

export default function Index() {
  const router = useRouter()
  useEffect(() => {
    router.push(`/${NETWORKS[1]}`)
  }, [router])

  return null
}

export { getServerSideProps } from 'layouts/chakra'
