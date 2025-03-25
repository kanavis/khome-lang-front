<script setup lang="ts">
import {
  lexiconSearchSchema,
  wordMeaningContainerSchema,
  wordMeaningContainersSchema,
} from '@/schemas'
import { HTTPClient } from '@/services/HTTPClient'
import AutoComplete from 'primevue/autocomplete'
import ProgressSpinner from 'primevue/progressspinner'
import { useUserDataStore } from '@/stores/userData'
import { ref } from 'vue'
import { z } from 'zod'
import WordPicture from '@/components/WordPicture.vue'
import WordSound from '@/components/WordSound.vue'

const httpClient = new HTTPClient()
const { userData } = useUserDataStore()
const userLanguage = userData?.settings.source_language
if (typeof userLanguage === 'undefined') {
  throw new Error('User language is not set')
}
console.log('User language is', userLanguage)

const lexiconSearchValue = ref(decodeURIComponent(window.location.hash.substring(1)) || '')
const lexiconSearchSuggestions = ref<string[]>([])
const lexiconSearchLoading = ref(false)
const lexiconSearchResults = ref<z.infer<typeof wordMeaningContainersSchema>>([])
const lexiconSearchLLMPrepare = ref(false)
const vocabularyAddButtonsLoading = ref<Map<number, boolean>>(new Map())

async function lexiconSearchSuggest() {
  console.log('Suggest', lexiconSearchValue.value)
  if (lexiconSearchValue.value === '') {
    lexiconSearchSuggestions.value = []
    lexiconSearchLoading.value = false
    return
  }
  lexiconSearchLoading.value = true
  const result = await httpClient.fetchJSON(
    `/api/lexicon/search?query=${encodeURIComponent(lexiconSearchValue.value)}`,
  )
  lexiconSearchSuggestions.value = lexiconSearchSchema.parse(result)
  lexiconSearchLoading.value = false
}

async function lexiconSearchSelected() {
  console.log('Selected', lexiconSearchValue.value)
  const urlFragment = lexiconSearchValue.value
  window.history.pushState(null, '', `#${encodeURIComponent(urlFragment)}`)
  lexiconSearchResults.value = []

  let result = await httpClient.fetchJSON(
    `/api/lexicon/meanings?word=${encodeURIComponent(lexiconSearchValue.value)}`,
  )
  if (typeof result === 'undefined') {
    lexiconSearchLLMPrepare.value = true
    result = await httpClient.fetchJSON(
      `/api/lexicon/meanings?word=${encodeURIComponent(lexiconSearchValue.value)}&llm=true`,
    )
    lexiconSearchLLMPrepare.value = false
  }
  lexiconSearchResults.value = wordMeaningContainersSchema.parse(result)
}

function lexiconSearchUnselected() {
  console.log('Unselected')
  lexiconSearchResults.value = []
}

async function addToVocabulary(wordMeaningContainer: z.infer<typeof wordMeaningContainerSchema>) {
  console.log('Add to vocabulary', wordMeaningContainer)
  vocabularyAddButtonsLoading.value.set(wordMeaningContainer.meaning.id, true)
  try {
    const result = await httpClient.fetchJSON(`/api/vocabulary`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meaning_id: wordMeaningContainer.meaning.id,
      }),
    })
    if (result) {
      wordMeaningContainer.added = true
    }
  } finally {
    vocabularyAddButtonsLoading.value.set(wordMeaningContainer.meaning.id, false)
  }
}

if (lexiconSearchValue.value !== '') {
  lexiconSearchSelected()
}
</script>

<template>
  <main>
    <h2>Vocabulary</h2>
    <label class="mb-medium">
      Search for a word to add:
      <AutoComplete
        v-model="lexiconSearchValue"
        :suggestions="lexiconSearchSuggestions"
        :loading="lexiconSearchLoading"
        @complete="lexiconSearchSuggest"
        @option-select="lexiconSearchSelected"
        @option-unselect="lexiconSearchUnselected"
        class="vocabulary-search"
      />
    </label>
    <div class="vocabulary-llm-prepare" v-if="lexiconSearchLLMPrepare">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p style="font-weight: bold">Preparing results from GPT...</p>
    </div>
    <div class="vocabulary-result" v-if="lexiconSearchResults.length > 0">
      <div
        v-for="wordMeaningContainer in lexiconSearchResults"
        :key="wordMeaningContainer.meaning.id"
        class="vocabulary-result-item"
      >
        <div class="vocabulary-result-item-word">
          <div class="mb-medium">{{ wordMeaningContainer.full_word }} -</div>
          <div class="mb-medium">
            {{ wordMeaningContainer.translations[userLanguage]?.translation }}
          </div>
          <div class="word-sound">
            <WordSound :full-word="wordMeaningContainer.full_word"></WordSound>
          </div>
        </div>
        <div class="vocabulary-result-item-description">
          <div class="mb-medium">
            Part of speech: {{ wordMeaningContainer.meaning.part_of_speech }}
          </div>
          <div>{{ wordMeaningContainer.translations[userLanguage]?.description }}</div>
        </div>
        <div class="vocabulary-result-item-picture">
          <WordPicture
            :meaningId="wordMeaningContainer.meaning.id"
            :alt="wordMeaningContainer.full_word"
          />
        </div>
        <div class="vocabulary-result-item-add">
          <button
            v-if="!wordMeaningContainer.added"
            @click="addToVocabulary(wordMeaningContainer)"
            :disabled="vocabularyAddButtonsLoading.get(wordMeaningContainer.meaning.id)"
          >
            Add
          </button>
          <span v-else>Added</span>
        </div>
      </div>
    </div>
  </main>
</template>
