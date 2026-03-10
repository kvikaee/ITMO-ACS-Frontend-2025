import axios from 'axios'
import { useAuth } from './useAuth'

const API_URL = 'http://localhost:3000'

export function useApi() {
  const { currentUser } = useAuth()

  // Вспомогательная функция для обновления данных пользователя
  const updateUser = async (data) => {
    if (!currentUser.value) return
    const response = await axios.patch(`${API_URL}/users/${currentUser.value.id}`, data)
    const updatedUser = response.data
    const { password: _, ...safeUser } = updatedUser
    currentUser.value = safeUser
    localStorage.setItem('currentUser', JSON.stringify(safeUser))
    return safeUser
  }

  // Получение количества лайков для рецепта
  const getLikesCount = async (recipeId) => {
  const response = await axios.get(`${API_URL}/likes`);
  const allLikes = response.data;
  return allLikes.filter(like => String(like.recipeId) === String(recipeId)).length;
}

  // Добавить лайк (аналог из оригинального auth.js)
  const likeRecipe = async (recipeId) => {
    if (!currentUser.value) throw new Error('Не авторизован')
    const userId = currentUser.value.id

    // 1. Удаляем все существующие лайки этого пользователя для данного рецепта
    const existingResponse = await axios.get(`${API_URL}/likes?recipeId=${String(recipeId)}&userId=${String(userId)}`)
    const existingLikes = existingResponse.data
    for (const like of existingLikes) {
      await axios.delete(`${API_URL}/likes/${like.id}`)
    }

    // 2. Создаём новый лайк
    await axios.post(`${API_URL}/likes`, {
      recipeId: String(recipeId),
      userId: String(userId)
    })

    // 3. Обновляем массив likedRecipes у пользователя (убеждаемся, что нет дублей)
    const updatedLikes = [...new Set([...currentUser.value.likedRecipes, String(recipeId)])]
    await updateUser({ likedRecipes: updatedLikes })

    // 4. Возвращаем актуальное количество лайков
    const newCount = await getLikesCount(recipeId)
    return { liked: true, count: newCount }
  }

  // Убрать лайк (аналог из оригинального auth.js)
  const unlikeRecipe = async (recipeId) => {
    if (!currentUser.value) throw new Error('Не авторизован')
    const userId = currentUser.value.id

    // 1. Удаляем все существующие лайки этого пользователя для данного рецепта
    const existingResponse = await axios.get(`${API_URL}/likes?recipeId=${String(recipeId)}&userId=${String(userId)}`)
    const existingLikes = existingResponse.data
    for (const like of existingLikes) {
      await axios.delete(`${API_URL}/likes/${like.id}`)
    }

    // 2. Удаляем рецепт из likedRecipes
    const updatedLikes = currentUser.value.likedRecipes.filter(id => id !== String(recipeId))
    await updateUser({ likedRecipes: updatedLikes })

    // 3. Возвращаем актуальное количество лайков
    const newCount = await getLikesCount(recipeId)
    return { liked: false, count: newCount }
  }

  // Остальные функции (getAllRecipes, getAuthorById, toggleSubscribe, getComments, addComment и т.д.) остаются без изменений
  const getAllRecipes = async () => {
    const response = await axios.get(`${API_URL}/recipes`)
    return response.data
  }

  const getRecipeById = async (id) => {
    const response = await axios.get(`${API_URL}/recipes/${id}`)
    return response.data
  }

  const getAllAuthors = async () => {
    const response = await axios.get(`${API_URL}/authors`)
    return response.data
  }

  const getAuthorById = async (id) => {
    const response = await axios.get(`${API_URL}/authors/${id}`)
    return response.data
  }

  const getComments = async (recipeId) => {
    const response = await axios.get(`${API_URL}/comments?recipeId=${recipeId}`)
    return response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const addComment = async (recipeId, text) => {
    if (!currentUser.value) throw new Error('Не авторизован')
    const newComment = {
      recipeId: String(recipeId),
      userId: String(currentUser.value.id),
      userName: currentUser.value.name,
      text,
      date: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    const response = await axios.post(`${API_URL}/comments`, newComment)
    return response.data
  }

  const toggleSubscribe = async (authorId) => {
    if (!currentUser.value) throw new Error('Не авторизован')
    const authorIdStr = String(authorId)
    const isSubscribed = currentUser.value.subscriptions.includes(authorIdStr)

    if (isSubscribed) {
      const updatedSubs = currentUser.value.subscriptions.filter(id => id !== authorIdStr)
      await updateUser({ subscriptions: updatedSubs })
      const author = await getAuthorById(authorId)
      await axios.patch(`${API_URL}/authors/${authorId}`, { followers: author.followers - 1 })
      return { subscribed: false }
    } else {
      const updatedSubs = [...currentUser.value.subscriptions, authorIdStr]
      await updateUser({ subscriptions: updatedSubs })
      const author = await getAuthorById(authorId)
      await axios.patch(`${API_URL}/authors/${authorId}`, { followers: author.followers + 1 })
      return { subscribed: true }
    }
  }

  const getRecipesByAuthor = async (authorId) => {
    const response = await axios.get(`${API_URL}/recipes?authorId=${authorId}`)
    return response.data
  }

  return {
    getAllRecipes,
    getRecipeById,
    getAllAuthors,
    getAuthorById,
    getLikesCount,
    likeRecipe,
    unlikeRecipe,
    getComments,
    addComment,
    toggleSubscribe,
    getRecipesByAuthor
  }
}