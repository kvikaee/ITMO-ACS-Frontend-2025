<template>
  <button
    class="btn btn-sm btn-outline-secondary"
    @click="toggleTheme"
    :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
  >
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>