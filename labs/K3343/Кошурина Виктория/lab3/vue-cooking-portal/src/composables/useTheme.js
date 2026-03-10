import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'theme'
const isDark = ref(localStorage.getItem(STORAGE_KEY) === 'dark')

// Применяем класс к body
watchEffect(() => {
  if (isDark.value) {
    document.body.classList.add('dark-theme')
    localStorage.setItem(STORAGE_KEY, 'dark')
  } else {
    document.body.classList.remove('dark-theme')
    localStorage.setItem(STORAGE_KEY, 'light')
  }
})

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
}