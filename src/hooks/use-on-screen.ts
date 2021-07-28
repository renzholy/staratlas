import { RefObject, useEffect, useState } from 'react'

export default function useOnScreen<T extends Element>(ref: RefObject<T>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
      },
      {
        rootMargin,
      },
    )
    const { current } = ref
    if (current) {
      observer.observe(current)
    }
    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [ref, rootMargin])
  return isIntersecting
}
