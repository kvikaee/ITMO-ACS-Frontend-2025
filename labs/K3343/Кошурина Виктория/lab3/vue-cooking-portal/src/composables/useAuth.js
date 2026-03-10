import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

// Реактивная переменная для текущего пользователя
const currentUser = ref(null)

// Загружаем пользователя из localStorage при инициализации
const savedUser = localStorage.getItem('currentUser')
if (savedUser) {
  currentUser.value = JSON.parse(savedUser)
}

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)

  const login = async (email, password) => {
    try {
      const response = await axios.get(`${API_URL}/users?email=${email}`)
      const users = response.data
      if (users.length === 0) throw new Error('Пользователь не найден')
      const user = users[0]
      if (user.password !== password) throw new Error('Неверный пароль')
      
      // Сохраняем пользователя (без пароля для безопасности)
      const { password: _, ...safeUser } = user
      currentUser.value = safeUser
      localStorage.setItem('currentUser', JSON.stringify(safeUser))
      return safeUser
    } catch (error) {
      throw error
    }
  }

  const register = async (name, email, password, bio = '') => {
    try {
      // Проверяем, нет ли уже такого email
      const checkResponse = await axios.get(`${API_URL}/users?email=${email}`)
      if (checkResponse.data.length > 0) {
        throw new Error('Пользователь с таким email уже существует')
      }

      const newUser = {
        name,
        email,
        password,
        bio,
        avatar: '/images/avatars/default.jpg',
        likedRecipes: [],
        subscriptions: []
      }

      const response = await axios.post(`${API_URL}/users`, newUser)
      const createdUser = response.data
      
      const { password: _, ...safeUser } = createdUser
      currentUser.value = safeUser
      localStorage.setItem('currentUser', JSON.stringify(safeUser))
      return safeUser
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const updateProfile = async (updatedData) => {
    if (!currentUser.value) throw new Error('Не авторизован')
    try {
      const response = await axios.patch(`${API_URL}/users/${currentUser.value.id}`, updatedData)
      const updatedUser = response.data
      const { password: _, ...safeUser } = updatedUser
      currentUser.value = safeUser
      localStorage.setItem('currentUser', JSON.stringify(safeUser))
      return safeUser
    } catch (error) {
      throw error
    }
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  }
}