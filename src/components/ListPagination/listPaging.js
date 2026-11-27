import { useEffect, useState } from 'react'

export const PAGE_SIZES = [20, 50, 100]

// Delays a value (e.g. search text) so the list reloads once typing pauses.
export const useDebouncedValue = (value, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
