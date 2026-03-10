<template>
  <div class="row">
    <div class="col-md-4">
      <div class="card">
        <div class="card-body text-center">
          <img
            :src="author.avatar || '/images/avatars/default.jpg'"
            alt="authorAvatar"
            class="rounded-circle mb-3"
            width="120"
            height="120"
          />
          <h2 class="h3">{{ author.name }}</h2>
          <p>{{ author.bio || '' }}</p>
          <p>Подписчиков: <span>{{ author.followers || 0 }}</span></p>
          <button
            v-if="isAuthenticated"
            class="btn"
            :class="isSubscribed ? 'btn-outline-primary' : 'btn-primary'"
            @click="toggleSubscribe"
          >
            {{ isSubscribed ? 'Отписаться' : 'Подписаться' }}
          </button>
          <button v-else class="btn btn-outline-secondary" disabled>
            Войдите, чтобы подписаться
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-8">
      <h3 class="h4">Рецепты блогера</h3>
      <div v-if="recipesLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>
      <div v-else-if="recipesError" class="alert alert-danger">{{ recipesError }}</div>
      <div v-else-if="recipes.length === 0" class="text-muted">
        У этого автора пока нет рецептов.
      </div>
      <div v-else class="row">
        <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'
import RecipeCard from '@/components/RecipeCard.vue'

const route = useRoute()
const { getAuthorById, getAllRecipes, toggleSubscribe: toggleSubscribeApi } = useApi()
const { currentUser, isAuthenticated } = useAuth()

const author = ref({})
const recipes = ref([])
const recipesLoading = ref(true)
const recipesError = ref(null)

const isSubscribed = computed(() => {
  if (!currentUser.value || !author.value.id) return false
  return currentUser.value.subscriptions.includes(String(author.value.id))
})

const loadAuthor = async () => {
  try {
    const authorId = route.params.authorId
    const authorData = await getAuthorById(authorId)
    author.value = authorData
  } catch (err) {
    console.error('Ошибка загрузки автора:', err)
  }
}

const loadAuthorRecipes = async () => {
  recipesLoading.value = true
  recipesError.value = null
  try {
    const allRecipes = await getAllRecipes()
    const authorId = route.params.authorId
    // Важно: сравниваем как строки, потому что в данных может быть число
    recipes.value = allRecipes.filter(r => String(r.authorId) === String(authorId))
  } catch (err) {
    recipesError.value = 'Не удалось загрузить рецепты.'
    console.error(err)
  } finally {
    recipesLoading.value = false
  }
}

const toggleSubscribe = async () => {
  try {
    const result = await toggleSubscribeApi(author.value.id)
    if (result.subscribed) {
      author.value.followers += 1
    } else {
      author.value.followers -= 1
    }
  } catch (err) {
    alert(err.message)
  }
}

onMounted(() => {
  loadAuthor()
  loadAuthorRecipes()
})
</script>