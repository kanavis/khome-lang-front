import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalErrorStore = defineStore('globalError', () => {
  const globalError = ref<Map<string, string>>(new Map())

  function setGlobalError(key: string, error: unknown) {
    globalError.value.set(key, error instanceof Error ? error.message : '' + error)
  }

  function unsetGlobalError(key: string) {
    globalError.value.delete(key)
  }

  return { globalError, setGlobalError, unsetGlobalError }
})
