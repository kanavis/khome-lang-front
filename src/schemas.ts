import { z } from 'zod'

export const lexiconSearchSchema = z.array(z.string())

export const wordMeaningTranslationSchema = z.object({
  id: z.number(),
  rating: z.number(),
  language: z.string(),
  translation: z.string(),
  description: z.string(),
})

export const wordMeaningSchema = z.object({
  id: z.number(),
  word: z.string(),
  part_of_speech: z.string(),
  gender: z.nullable(z.string()),
})

export const wordMeaningContainerSchema = z.object({
  meaning: wordMeaningSchema,
  full_word: z.string(),
  added: z.boolean(),
  translations: z.record(wordMeaningTranslationSchema),
})

export const wordMeaningContainersSchema = z.array(wordMeaningContainerSchema)
