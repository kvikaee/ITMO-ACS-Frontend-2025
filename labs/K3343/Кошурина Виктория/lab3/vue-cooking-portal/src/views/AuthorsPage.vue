<template>
  <div>
    <h1 class="h2 mb-4">Популярные кулинары</h1>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <AuthorCard v-for="author in authors" :key="author.id" :author="author" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import AuthorCard from '@/components/AuthorCard.vue'

const { getAllAuthors } = useApi()
const authors = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    authors.value = await getAllAuthors()
  } catch (err) {
    error.value = 'Не удалось загрузить список кулинаров.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>