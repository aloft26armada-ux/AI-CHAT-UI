import { useState, useEffect } from 'react'

/**
 * useLocalStorage hook - sync state with localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      console.warn(`useLocalStorage set error for ${key}`, e)
    }
  }

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue? JSON.parse(e.newValue) : initialValue)
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, initialValue])

  return [storedValue, setValue]
}
