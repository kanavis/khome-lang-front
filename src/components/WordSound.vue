<script setup lang="ts">
import { ref } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import { HTTPClient } from '@/services/HTTPClient'

const httpClient = new HTTPClient()

const props = defineProps<{
  fullWord: string
}>()

const loaded = ref(false)
const loading = ref(true)
const loadingGPT = ref(false)
const audio = ref(new Audio())
const isPlaying = ref(false)

async function init() {
  const result = await httpClient.fetchJSON(
    `/api/lexicon/ensure_sounds?full_word=${props.fullWord}`,
  )
  if (typeof result === 'undefined') {
    loadingGPT.value = true
    await httpClient.fetchJSON(`/api/lexicon/ensure_sounds?full_word=${props.fullWord}&llm=true`)
  }
  audio.value.src = `/api/lexicon/sounds/${props.fullWord}.mp3`
  loading.value = false
  loadingGPT.value = false
  loaded.value = true
}

function play() {
  isPlaying.value = true
  audio.value.play()
}

audio.value.onended = () => {
  isPlaying.value = false
}
audio.value.onerror = () => {
  isPlaying.value = false
}

init()
</script>

<template>
  <button v-if="!loading && loaded" class="play-sound-button" :disabled="isPlaying" @click="play">
    ▶
  </button>
  <div v-if="loading && !loaded">
    <ProgressSpinner />
    <span v-if="loadingGPT"><br />GPT generating...</span>
  </div>
</template>
