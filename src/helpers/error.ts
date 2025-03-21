import { useGlobalErrorStore } from '@/stores/globalError'

export function setGlobalError(key: string, error: unknown) {
  console.error('Global error', key, error)
  const { setGlobalError } = useGlobalErrorStore()
  setGlobalError(key, error)
}

export function unsetGlobalError(key: string) {
  const { unsetGlobalError } = useGlobalErrorStore()
  unsetGlobalError(key)
}
