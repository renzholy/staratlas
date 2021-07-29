import flatten from 'lodash/flatten'
import { useMemo } from 'react'
import { SWRInfiniteResponse } from 'swr'

const PAGE_SIZE = 10

export default function useInfinite<T>(list: SWRInfiniteResponse<T[], Error>) {
  const { data, error, isValidating, size, setSize } = list
  const issues = useMemo(() => (data ? flatten(data) : undefined), [data])
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)
  const isRefreshing = isValidating && data && data.length === size

  return {
    data: issues,
    setSize,
    isEmpty,
    isLoadingInitialData,
    isLoadingMore,
    isReachingEnd,
    isRefreshing,
  }
}
