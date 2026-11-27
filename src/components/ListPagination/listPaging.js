import { useEffect, useState } from 'react'

// Rows per page, the same as the other tables.
export const PAGE_SIZE = 10

// Delays a value (e.g. search text) so the list reloads once typing pauses.
export const useDebouncedValue = (value, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}
