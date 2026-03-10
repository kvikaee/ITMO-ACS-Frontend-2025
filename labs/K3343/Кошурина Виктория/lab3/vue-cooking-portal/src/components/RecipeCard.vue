<template>
  <div class="col-md-4 mb-4">
    <div class="card recipe-card h-100">
      <img
        :src="recipe.image || '/images/recipes/placeholder.jpg'"
        class="card-img-top"
        :alt="recipe.title"
        style="height: 200px; object-fit: cover;"
      />
      <div class="card-body d-flex flex-column">
        <h3 class="card-title h5">{{ recipe.title }}</h3>
        <p class="card-text flex-grow-1">
          <span class="badge bg-secondary">{{ recipe.type }}</span>
          <span class="badge bg-secondary">{{ recipe.difficulty }}</span>
        </p>
        <router-link :to="{ name: 'recipe', params: { id: recipe.id } }" class="btn btn-primary mt-2">
          Посмотреть
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  recipe: {
    type: Object,
    required: true
  }
})
</script>