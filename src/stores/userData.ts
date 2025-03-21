import { defineStore } from 'pinia'
import { ref } from 'vue'
import { z } from 'zod'

export const userSettingsSchema = z.object({
  source_language: z.string(),
  words_per_day: z.number(),
  notification_email: z.string(),
  enable_notifications: z.boolean(),
})

export const userSchema = z.object({
  id: z.number(),
  username: z.nullable(z.string()),
  email: z.string(),
  is_superuser: z.boolean(),
})

export const userDataSchema = z.object({
  user: userSchema,
  settings: userSettingsSchema,
})

export const useUserDataStore = defineStore('userData', () => {
  const userData = ref<z.infer<typeof userDataSchema> | undefined>(undefined)

  function setUserData(data: z.infer<typeof userDataSchema>) {
    userData.value = data
  }

  return { userData, setUserData }
})
