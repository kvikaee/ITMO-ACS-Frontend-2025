<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <svg width="1em" height="1em" viewBox="0 2 16 16">
          <use href="/images/sprite.svg#apple"></use>
        </svg>
        Рецепты
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/search">Поиск</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/authors">Кулинары</router-link>
          </li>
        </ul>
        <div class="d-flex">
          <AuthButtons />
        </div>
        <div class="d-flex ms-2">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import AuthButtons from './AuthButtons.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
</script>