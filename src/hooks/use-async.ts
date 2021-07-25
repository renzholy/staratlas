import { useState, useCallback, useEffect } from 'react'

export default function useAsync<T, A extends Array<unknown>>(
  asyncFunction: (...args: A) => Promise<T> | undefined,
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T>()
  const [error, setError] = useState<Error>()
  useEffect(() => {
    setStatus('idle')
  }, [asyncFunction])
  const execute = useCallback(
    async (...args: A) => {
      setStatus('pending')
      setValue(undefined)
      setError(undefined)
      try {
        const response = await asyncFunction(...args)
        setValue(response)
        setStatus('success')
      } catch (err) {
        setError(err)
        setStatus('error')
      }
    },
    [asyncFunction],
  )
  return { execute, status, value, error }
}
