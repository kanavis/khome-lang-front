<script setup lang="ts">
import { ref } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import { HTTPClient } from '@/services/HTTPClient'

const httpClient = new HTTPClient()

const props = defineProps<{
  meaningId: number
  alt: string
}>()

const loaded = ref(false)
const loading = ref(true)
const loadingGPT = ref(false)
const pictureSrc = ref('')

async function init() {
  const result = await httpClient.fetchJSON(
    `/api/lexicon/ensure_illustrations?word_meaning_id=${props.meaningId}`,
  )
  if (typeof result === 'undefined') {
    loadingGPT.value = true
    await httpClient.fetchJSON(
      `/api/lexicon/ensure_illustrations?word_meaning_id=${props.meaningId}&llm=true`,
    )
  }
  pictureSrc.value = `/api/lexicon/illustrations/${props.meaningId}.png`
  loading.value = false
  loadingGPT.value = false
  loaded.value = true
}

init()
</script>

<template>
  <img v-if="loaded" :src="pictureSrc" :alt="alt" />
  <div v-if="loading && !loaded">
    <ProgressSpinner />
    <span v-if="loadingGPT"><br />GPT generating...</span>
  </div>
</template>
