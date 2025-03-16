<script setup lang="ts">
import { useUserDataStore } from '@/stores/userData'

const { userData } = useUserDataStore()
</script>

<template>
  <main>
    Hello, {{ userData?.user?.username ? userData?.user?.username : userData?.user?.email }}!<br />
  </main>
</template>
