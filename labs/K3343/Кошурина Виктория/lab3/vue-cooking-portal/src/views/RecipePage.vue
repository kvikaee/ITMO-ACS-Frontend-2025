<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Загрузка...</span>
    </div>
  </div>
  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
  <div v-else class="row">
    <div class="col-md-8">
      <h1>{{ recipe.title }}</h1>
      <p class="lead">{{ recipe.description }}</p>
      <img :src="recipe.image || '/images/recipes/placeholder.jpg'" class="img-fluid rounded" :alt="recipe.title" />
      
      <div class="d-flex justify-content-between align-items-center my-3">
        <div>
          <span class="badge bg-secondary me-1">{{ recipe.type }}</span>
          <span class="badge bg-secondary">{{ recipe.difficulty }}</span>
        </div>
        <button class="btn btn-outline-danger" @click="handleLike">
          <i :class="isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i> {{ likesCount }}
        </button>
      </div>

      <h2 class="h4">Ингредиенты</h2>
      <ul>
        <li v-for="(ing, index) in recipe.ingredients" :key="index">{{ ing }}</li>
      </ul>

      <h2 class="h4">Пошаговые инструкции</h2>
      <ol>
        <li v-for="(step, index) in recipe.steps" :key="index">{{ step }}</li>
      </ol>

      <h2 class="h4">Видео</h2>
      <div v-if="recipe.videoUrl" class="ratio ratio-16x9 mb-4">
        <iframe :src="recipe.videoUrl" allowfullscreen></iframe>
      </div>
      <p v-else>Видео отсутствует</p>

      <hr />

      <h2 class="h4">Комментарии</h2>
      <div v-if="commentsLoading" class="text-center">Загрузка комментариев...</div>
      <div v-else>
        <div v-if="comments.length === 0" class="text-muted">Пока нет комментариев. Будьте первым!</div>
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <div class="d-flex justify-content-between">
            <strong>{{ comment.userName }}</strong>
            <span class="text-muted small">{{ comment.date }}</span>
          </div>
          <p class="mb-0">{{ comment.text }}</p>
        </div>
      </div>

      <form @submit.prevent="submitComment" class="mt-3" v-if="isAuthenticated">
        <div class="mb-3">
          <label for="commentText" class="form-label">Ваш комментарий</label>
          <textarea class="form-control" id="commentText" rows="2" v-model="newCommentText" placeholder="Напишите что-нибудь..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Отправить</button>
      </form>
      <p v-else class="mt-3"><router-link :to="{ name: 'login' }">Войдите</router-link>, чтобы комментировать.</p>
    </div>

    <div class="col-md-4 mt-3 mt-md-0">
      <div class="card">
        <div class="card-body">
          <h3 class="h5">Автор рецепта</h3>
          <div class="d-flex align-items-center">
            <img :src="author.avatar || '/images/avatars/default.jpg'" width="50" height="50" class="rounded-circle me-2" />
            <div>
              <router-link :to="{ name: 'blog', params: { authorId: author.id } }">{{ author.name }}</router-link>
              <br />
              <small>Подписчиков: {{ author.followers || 0 }}</small>
            </div>
          </div>
          <button v-if="isAuthenticated" class="btn mt-2 w-100" :class="isSubscribed ? 'btn-outline-primary' : 'btn-primary'" @click="toggleSubscribe">
            {{ isSubscribed ? 'Отписаться' : 'Подписаться' }}
          </button>
          <button v-else class="btn btn-outline-secondary mt-2 w-100" disabled>Войдите, чтобы подписаться</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useApi } from '@/composables/useApi'
  import { useAuth } from '@/composables/useAuth'

  const route = useRoute()
  const { getRecipeById, getAuthorById, getLikesCount, likeRecipe, unlikeRecipe, getComments, addComment, toggleSubscribe: toggleSubscribeApi } = useApi()
  const { currentUser, isAuthenticated } = useAuth()

  const recipe = ref(null)
  const author = ref({})
  const loading = ref(true)
  const error = ref(null)

  const likesCount = ref(0)
  const isLiked = ref(false)

  const comments = ref([])
  const commentsLoading = ref(true)
  const newCommentText = ref('')

  const isSubscribed = computed(() => {
    if (!currentUser.value || !author.value) return false
    return currentUser.value.subscriptions.includes(String(author.value.id))
  })

  const loadRecipe = async () => {
      try {
        const recipeId = route.params.id
        const recipeData = await getRecipeById(recipeId)
        recipe.value = recipeData

        const authorData = await getAuthorById(recipeData.authorId)
        author.value = authorData

        likesCount.value = await getLikesCount(recipeId)
        console.log('Initial likesCount:', likesCount.value);
        if (currentUser.value) {
          isLiked.value = currentUser.value.likedRecipes.includes(String(recipeId))
        }
      } catch (err) {
        error.value = 'Не удалось загрузить рецепт.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

  const loadComments = async () => {
    try {
      comments.value = await getComments(route.params.id)
    } catch (err) {
      console.error(err)
    } finally {
      commentsLoading.value = false
    }
  }

  const handleLike = async () => {
  if (!isAuthenticated.value) {
    alert('Войдите, чтобы ставить лайки');
    return;
  }
  try {
    let result;
    if (isLiked.value) {
      result = await unlikeRecipe(recipe.value.id);
    } else {
      result = await likeRecipe(recipe.value.id);
    }
    console.log('handleLike result:', result);
    likesCount.value = result.count;
    isLiked.value = result.liked;
  } catch (err) {
    alert(err.message);
  }
}

  const submitComment = async () => {
    if (!newCommentText.value.trim()) return
    try {
      await addComment(recipe.value.id, newCommentText.value)
      newCommentText.value = ''
      loadComments()
    } catch (err) {
      alert('Не удалось добавить комментарий')
    }
  }

  const toggleSubscribe = async () => {
    try {
      const result = await toggleSubscribeApi(author.value.id)
      // После подписки/отписки обновим данные автора (подписчики) и пользователя в currentUser обновится автоматически через useApi
      // Просто обновим локально отображаемое число подписчиков
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
    loadRecipe()
    loadComments()
  })
</script>

<style scoped>
.comment {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}
</style>