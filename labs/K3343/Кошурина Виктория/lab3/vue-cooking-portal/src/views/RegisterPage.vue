<template>
  <div class="container mt-5" style="max-width: 500px;">
    <h1 class="text-center mb-4 h2">Регистрация</h1>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="name" class="form-label">Имя</label>
        <input type="text" class="form-control" id="name" v-model="name" required />
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="email" required />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Пароль</label>
        <input type="password" class="form-control" id="password" v-model="password" required />
      </div>
      <div class="mb-3">
        <label for="bio" class="form-label">О себе (необязательно)</label>
        <textarea class="form-control" id="bio" rows="3" v-model="bio"></textarea>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Зарегистрироваться
      </button>
      <p class="mt-3 text-center">
        Уже есть аккаунт? <router-link :to="{ name: 'login' }">Войдите</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { register } = useAuth()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const bio = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!name.value || !email.value || !password.value) {
    alert('Заполните имя, email и пароль')
    return
  }
  if (password.value.length < 6) {
    alert('Пароль должен быть не менее 6 символов')
    return
  }
  if (!email.value.includes('@') || !email.value.includes('.')) {
    alert('Введите корректный email')
    return
  }
  loading.value = true
  try {
    await register(name.value, email.value, password.value, bio.value)
    router.push('/profile')
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}
</script>