<template>
  <div class="col-md-4 mb-4">
    <div class="card h-100 text-center">
      <div class="card-body d-flex flex-column">
        <img
          :src="author.avatar || '/images/avatars/default.jpg'"
          :alt="author.name"
          class="rounded-circle mx-auto mb-3"
          width="120"
          height="120"
          style="object-fit: cover;"
        />
        <h3 class="card-title h5">{{ author.name }}</h3>
        <p class="card-text flex-grow-1">{{ author.bio || '' }}</p>
        <p class="text-muted">Подписчиков: {{ author.followers || 0 }}</p>
        <router-link :to="{ name: 'blog', params: { authorId: author.id } }" class="btn btn-outline-primary mt-2">
          Профиль
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  author: {
    type: Object,
    required: true
  }
})
</script>