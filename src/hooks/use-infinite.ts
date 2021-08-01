import flatten from 'lodash/flatten'
import { useMemo } from 'react'
import type { SWRInfiniteResponse } from 'swr/infinite'
import { API_PAGE_SIZE } from 'utils/constants'

export default function useInfinite<T>(
  list: SWRInfiniteResponse<T[], Error>,
  pageSize = API_PAGE_SIZE,
) {
  const { data, error, isValidating, size, setSize } = list
  const issues = useMemo(() => (data ? flatten(data) : undefined), [data])
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = issues?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < pageSize)
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
