<template>
  <div class="container mt-5" style="max-width: 400px;">
    <h1 class="text-center mb-4 h2">Вход</h1>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="email" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Пароль</label>
        <input type="password" class="form-control" id="password" v-model="password" required />
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Войти
      </button>
      <p class="mt-3 text-center">
        Нет аккаунта? <router-link :to="{ name: 'register' }">Зарегистрируйтесь</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    alert('Заполните все поля')
    return
  }
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push('/profile')
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}
</script>