import { createRouter, createWebHistory } from 'vue-router'

// Импортируем страницы (пока создадим простые заглушки)
import HomePage from '@/views/HomePage.vue'
import SearchPage from '@/views/SearchPage.vue'
import AuthorsPage from '@/views/AuthorsPage.vue'
import BlogPage from '@/views/BlogPage.vue'
import RecipePage from '@/views/RecipePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/search', name: 'search', component: SearchPage },
  { path: '/authors', name: 'authors', component: AuthorsPage },
  { path: '/blog/:authorId', name: 'blog', component: BlogPage },
  { path: '/recipe/:id', name: 'recipe', component: RecipePage },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Защита маршрутов: если требуется авторизация, а пользователь не залогинен, перенаправляем на логин
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('currentUser')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router