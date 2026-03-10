<template>
  <template v-if="isAuthenticated">
    <router-link :to="{ name: 'profile' }" class="btn btn-outline-primary me-2">
      {{ currentUser.name }}
    </router-link>
    <button class="btn btn-outline-danger" @click="handleLogout">Выйти</button>
  </template>
  <template v-else>
    <router-link :to="{ name: 'login' }" class="btn btn-outline-primary me-2">Вход</router-link>
    <router-link :to="{ name: 'register' }" class="btn btn-primary">Регистрация</router-link>
  </template>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { currentUser, isAuthenticated, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>