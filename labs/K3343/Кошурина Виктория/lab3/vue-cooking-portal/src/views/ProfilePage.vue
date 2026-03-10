<template>
  <div class="row">
    <div class="col-md-4">
      <div class="card">
        <div class="card-body text-center">
          <img
            src="/images/avatars/default.jpg"
            alt="yourProfileAvatar"
            class="rounded-circle mb-3"
            width="120"
            height="120"
          />
          <h2 class="h3" id="profileName">{{ user?.name || 'Имя' }}</h2>
          <p id="profileEmail">{{ user?.email || 'Email' }}</p>
          <p id="profileBio">{{ user?.bio || 'Пока ничего не рассказано о себе.' }}</p>
          <button class="btn btn-outline-primary" @click="openEditModal">
            <svg width="1em" height="1.3em" viewBox="0 1.5 16 16" fill="currentColor">
              <use href="/images/sprite.svg#pencil"></use>
            </svg>
            Редактировать
          </button>
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <ul class="nav nav-tabs" id="profileTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="saved-tab"
            data-bs-toggle="tab"
            data-bs-target="#saved"
            type="button"
            role="tab"
          >
            Сохранённые
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="subscriptions-tab"
            data-bs-toggle="tab"
            data-bs-target="#subscriptions"
            type="button"
            role="tab"
          >
            Мои подписки
          </button>
        </li>
      </ul>
      <div class="tab-content pt-3" id="profileTabsContent">
        <div class="tab-pane fade show active" id="saved" role="tabpanel">
          <div v-if="savedLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
          </div>
          <div v-else-if="savedError" class="alert alert-danger">{{ savedError }}</div>
          <div v-else-if="savedRecipes.length === 0" class="text-muted">
            У вас пока нет сохранённых рецептов.
          </div>
          <div v-else class="row">
            <div v-for="recipe in savedRecipes" :key="recipe.id" class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="row g-0">
                  <div class="col-md-4">
                    <img
                      :src="recipe.image || '/images/recipes/placeholder.jpg'"
                      class="img-fluid rounded-start h-100"
                      :alt="recipe.title"
                      style="object-fit: cover; height: 100%; width: 100%;"
                    />
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h3 class="card-title h5">{{ recipe.title }}</h3>
                      <p class="card-text">
                        <span class="badge bg-secondary">{{ recipe.type }}</span>
                        <span class="badge bg-secondary">{{ recipe.difficulty }}</span>
                      </p>
                      <router-link :to="{ name: 'recipe', params: { id: recipe.id } }" class="btn btn-sm btn-primary">
                        Посмотреть
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="subscriptions" role="tabpanel">
          <div v-if="subsLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Загрузка...</span>
            </div>
          </div>
          <div v-else-if="subsError" class="alert alert-danger">{{ subsError }}</div>
          <div v-else-if="subscriptions.length === 0" class="text-muted">
            Вы пока ни на кого не подписаны.
          </div>
          <div v-else class="row">
            <div v-for="author in subscriptions" :key="author.id" class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="card-body d-flex align-items-center">
                  <img
                    :src="author.avatar || '/images/avatars/default.jpg'"
                    :alt="author.name"
                    class="rounded-circle me-3"
                    width="60"
                    height="60"
                    style="object-fit: cover;"
                  />
                  <div class="flex-grow-1">
                    <h3 class="card-title mb-1 h5">{{ author.name }}</h3>
                    <p class="card-text small text-muted mb-2">{{ author.bio || '' }}</p>
                    <p class="card-text small">Подписчиков: {{ author.followers || 0 }}</p>
                  </div>
                  <router-link :to="{ name: 'blog', params: { authorId: author.id } }" class="btn btn-sm btn-outline-primary">
                    Профиль
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальное окно редактирования профиля -->
  <div class="modal fade" id="editProfileModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Редактировать профиль</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProfile">
            <div class="mb-3">
              <label for="editName" class="form-label">Имя</label>
              <input type="text" class="form-control" id="editName" v-model="editForm.name" required />
            </div>
            <div class="mb-3">
              <label for="editBio" class="form-label">О себе</label>
              <textarea class="form-control" id="editBio" rows="3" v-model="editForm.bio"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary" @click="saveProfile">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'
import { useRouter } from 'vue-router'

const { currentUser, isAuthenticated, updateProfile } = useAuth()
const { getAllRecipes, getAllAuthors } = useApi()
const router = useRouter()

// Если пользователь не авторизован, перенаправляем на логин
if (!isAuthenticated.value) {
  router.push({ name: 'login' })
}

const user = ref(currentUser.value)

// Данные для сохранённых рецептов
const savedRecipes = ref([])
const savedLoading = ref(true)
const savedError = ref(null)

// Данные для подписок
const subscriptions = ref([])
const subsLoading = ref(true)
const subsError = ref(null)

// Форма редактирования
const editForm = ref({
  name: user.value?.name || '',
  bio: user.value?.bio || ''
})

// Загрузка сохранённых рецептов
const loadSavedRecipes = async () => {
  if (!user.value?.likedRecipes || user.value.likedRecipes.length === 0) {
    savedLoading.value = false
    return
  }
  try {
    const allRecipes = await getAllRecipes()
    savedRecipes.value = allRecipes.filter(recipe =>
      user.value.likedRecipes.includes(recipe.id)
    )
  } catch (err) {
    savedError.value = 'Не удалось загрузить сохранённые рецепты.'
    console.error(err)
  } finally {
    savedLoading.value = false
  }
}

// Загрузка подписок (авторов)
const loadSubscriptions = async () => {
  if (!user.value?.subscriptions || user.value.subscriptions.length === 0) {
    subsLoading.value = false
    return
  }
  try {
    const allAuthors = await getAllAuthors()
    subscriptions.value = allAuthors.filter(author =>
      user.value.subscriptions.includes(author.id)
    )
  } catch (err) {
    subsError.value = 'Не удалось загрузить список подписок.'
    console.error(err)
  } finally {
    subsLoading.value = false
  }
}

// Открыть модальное окно
const openEditModal = () => {
  editForm.value.name = user.value?.name || ''
  editForm.value.bio = user.value?.bio || ''
  const modal = new window.bootstrap.Modal(document.getElementById('editProfileModal'))
  modal.show()
}

// Сохранить изменения
const saveProfile = async () => {
  try {
    const updatedUser = await updateProfile({
      name: editForm.value.name,
      bio: editForm.value.bio
    })
    user.value = updatedUser
    // Закрыть модальное окно
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('editProfileModal'))
    modal.hide()
  } catch (err) {
    alert('Не удалось обновить профиль: ' + err.message)
  }
}

onMounted(() => {
  loadSavedRecipes()
  loadSubscriptions()
})
</script>