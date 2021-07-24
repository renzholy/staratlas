import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { NETWORKS } from '../constants'

export default function Redirect() {
  const history = useHistory()
  useEffect(() => {
    history.push(`/${NETWORKS[1]}`)
  }, [history])

  return null
}
