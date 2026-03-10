<template>
  <div>
    <h1 class="visually-hidden">Кулинарный портал</h1>
    
    <section class="mb-5">
      <h2 class="mb-4">Популярные рецепты</h2>
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else class="row">
        <RecipeCard v-for="recipe in featuredRecipes" :key="recipe.id" :recipe="recipe" />
      </div>
    </section>

    <section>
      <h2 class="mb-4">Лучшие кулинары</h2>
      <div v-if="loadingAuthors" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>
      <div v-else-if="authorsError" class="alert alert-danger">{{ authorsError }}</div>
      <div v-else class="row">
        <AuthorCard v-for="author in topAuthors" :key="author.id" :author="author" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import RecipeCard from '@/components/RecipeCard.vue'
import AuthorCard from '@/components/AuthorCard.vue'

const { getAllRecipes, getAllAuthors } = useApi()

const featuredRecipes = ref([])
const loading = ref(true)
const error = ref(null)

const topAuthors = ref([])
const loadingAuthors = ref(true)
const authorsError = ref(null)

onMounted(async () => {
  try {
    const recipes = await getAllRecipes()
    featuredRecipes.value = recipes.slice(0, 3)
  } catch (err) {
    error.value = 'Не удалось загрузить рецепты. Проверьте подключение к серверу.'
    console.error(err)
  } finally {
    loading.value = false
  }

  try {
    const authors = await getAllAuthors()
    topAuthors.value = authors.slice(0, 3)
  } catch (err) {
    authorsError.value = 'Не удалось загрузить кулинаров.'
    console.error(err)
  } finally {
    loadingAuthors.value = false
  }
})
</script>