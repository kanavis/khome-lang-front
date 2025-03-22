<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useGlobalErrorStore } from './stores/globalError'
import { useUserDataStore } from './stores/userData'
import { toRefs } from 'vue'
import { doLogout } from './helpers/auth'

const { globalError } = useGlobalErrorStore()

const { userData } = toRefs(useUserDataStore())
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="navbar">
        <div class="navbar-links">
          <ul>
            <li><RouterLink activeClass="active" to="/">Home</RouterLink></li>
            <li>
              <RouterLink activeClass="active" to="/vocabulary/add">Add to vocabulary</RouterLink>
            </li>
          </ul>
        </div>
        <div class="navbar-user">
          <span>
            Logged in as
            {{ userData?.user?.username ? userData?.user?.username : userData?.user?.email }}
          </span>
          &nbsp;
          <a @click="doLogout()">Logout</a>
        </div>
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
