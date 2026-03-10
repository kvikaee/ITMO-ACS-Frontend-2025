<template>
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
        @click="handleSubscribe"
        :disabled="subscribing"
      >
        {{ isSubscribed ? 'Отписаться' : 'Подписаться' }}
      </button>
      <button v-else class="btn btn-outline-secondary" disabled>Войдите, чтобы подписаться</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  author: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:author'])

const { currentUser, isAuthenticated } = useAuth()
const { toggleSubscribe } = useApi()
const subscribing = ref(false)

const isSubscribed = computed(() => {
  if (!currentUser.value || !props.author) return false
  return currentUser.value.subscriptions.includes(String(props.author.id))
})

const handleSubscribe = async () => {
  if (subscribing.value) return
  subscribing.value = true
  try {
    const result = await toggleSubscribe(props.author.id)
    // Обновляем локально количество подписчиков
    const updatedAuthor = { ...props.author, followers: props.author.followers + (result.subscribed ? 1 : -1) }
    emit('update:author', updatedAuthor)
  } catch (err) {
    alert(err.message)
  } finally {
    subscribing.value = false
  }
}
</script>