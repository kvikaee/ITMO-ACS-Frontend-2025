<template>
  <div>
    <h1 class="h2 mb-4">Поиск рецептов</h1>
    <div class="row">
      <!-- Фильтры -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="mb-3">
              <label for="searchByName" class="form-label">Название рецепта</label>
              <input
                type="text"
                class="form-control"
                id="searchByName"
                v-model="filters.name"
                placeholder="Введите название..."
              />
            </div>
            <hr />
            <h2 class="h5">Фильтры</h2>
            <h3 class="h6">Тип блюда</h3>
            <div class="form-check" v-for="type in recipeTypes" :key="type.value">
              <input
                class="form-check-input"
                type="checkbox"
                :id="'type-' + type.value"
                :value="type.value"
                v-model="filters.types"
              />
              <label class="form-check-label" :for="'type-' + type.value">{{ type.label }}</label>
            </div>

            <h3 class="h6 mt-3">Сложность</h3>
            <div class="form-check" v-for="diff in difficulties" :key="diff.value">
              <input
                class="form-check-input"
                type="radio"
                name="difficulty"
                :id="'diff-' + diff.value"
                :value="diff.value"
                v-model="filters.difficulty"
              />
              <label class="form-check-label" :for="'diff-' + diff.value">{{ diff.label }}</label>
            </div>

            <label for="ingredientInput" class="mt-3 h6">Ингредиент</label>
            <div class="mb-2">
              <input
                type="text"
                class="form-control"
                id="ingredientInput"
                v-model="newIngredient"
                @keyup.enter="addIngredient"
                placeholder="Например, картофель"
              />
              <button class="btn btn-sm btn-outline-secondary mt-1" @click="addIngredient">Добавить</button>
            </div>

            <div id="ingredientsList" class="mb-2">
              <span
                v-for="(ing, index) in filters.ingredients"
                :key="index"
                class="badge bg-secondary me-1"
                style="font-size: 1rem; padding: 0.5rem;"
              >
                {{ ing }}
                <span style="cursor:pointer; margin-left:5px;" @click="removeIngredient(index)">✕</span>
              </span>
            </div>

            <button class="btn btn-primary w-100 mt-3" @click="applyFilters">Применить</button>
          </div>
        </div>
      </div>

      <!-- Результаты -->
      <div class="col-md-9">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else-if="filteredRecipes.length === 0" class="text-muted">Ничего не найдено</div>
        <div v-else class="row">
          <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.id" :recipe="recipe" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import RecipeCard from '@/components/RecipeCard.vue'

const { getAllRecipes } = useApi()

const allRecipes = ref([])
const filteredRecipes = ref([])
const loading = ref(true)
const error = ref(null)

// Варианты фильтров
const recipeTypes = [
  { value: 'суп', label: 'Суп' },
  { value: 'основное', label: 'Основное блюдо' },
  { value: 'десерт', label: 'Десерт' },
  { value: 'салат', label: 'Салат' },
  { value: 'закуска', label: 'Закуска' }
]

const difficulties = [
  { value: '', label: 'Любая' },
  { value: 'легко', label: 'Легко' },
  { value: 'средне', label: 'Средне' },
  { value: 'сложно', label: 'Сложно' }
]

// Состояние фильтров
const filters = ref({
  name: '',
  types: [],
  difficulty: '',
  ingredients: []
})

const newIngredient = ref('')

// Загрузка всех рецептов
onMounted(async () => {
  try {
    allRecipes.value = await getAllRecipes()
    filteredRecipes.value = allRecipes.value
  } catch (err) {
    error.value = 'Не удалось загрузить рецепты.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

// Добавление ингредиента
const addIngredient = () => {
  const ing = newIngredient.value.trim().toLowerCase()
  if (ing && !filters.value.ingredients.includes(ing)) {
    filters.value.ingredients.push(ing)
  }
  newIngredient.value = ''
}

// Удаление ингредиента по индексу
const removeIngredient = (index) => {
  filters.value.ingredients.splice(index, 1)
}

// Применение фильтров
const applyFilters = () => {
  let results = allRecipes.value

  // Поиск по названию
  if (filters.value.name) {
    const nameLower = filters.value.name.toLowerCase()
    results = results.filter(r => r.title.toLowerCase().includes(nameLower))
  }

  // Фильтр по типам
  if (filters.value.types.length > 0) {
    results = results.filter(r => filters.value.types.includes(r.type))
  }

  // Фильтр по сложности
  if (filters.value.difficulty) {
    results = results.filter(r => r.difficulty === filters.value.difficulty)
  }

  // Фильтр по ингредиентам (все выбранные ингредиенты должны присутствовать в рецепте)
  if (filters.value.ingredients.length > 0) {
    results = results.filter(r => {
      return filters.value.ingredients.every(ing => r.ingredients.includes(ing))
    })
  }

  filteredRecipes.value = results
}
</script>