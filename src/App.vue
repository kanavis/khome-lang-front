<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useGlobalErrorStore } from './stores/globalError'

const { globalError } = useGlobalErrorStore()
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="navbar">
        <ul>
          <li><RouterLink activeClass="active" to="/">Home</RouterLink></li>
          <li><RouterLink activeClass="active" to="/vocabulary">Vocabulary</RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="content">
    <div class="error mb-medium" v-if="globalError.size > 0">
      Errors:
      <div v-for="key in globalError.keys()" :key="key">{{ globalError.get(key) }}</div>
    </div>
    <RouterView />
  </div>
</template>
