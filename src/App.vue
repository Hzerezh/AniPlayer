<script setup lang="ts">
import VideoPlayerLayout from './components/VideoPlayerLayout.vue'
</script>

<template>
  <main class="app">
    <VideoPlayerLayout />
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(40, 40, 50, 0.9), #080808 55%);
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 1.5rem;
}

@media (max-width: 1024px) {
  .app {
    padding: 1rem;
  }
}
</style>
