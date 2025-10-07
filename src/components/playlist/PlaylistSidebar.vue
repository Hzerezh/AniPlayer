<script setup lang="ts">
import { computed } from 'vue'
import SortableList from './SortableList.vue'
import { usePlayerStore } from '../../stores/player'

const store = usePlayerStore()

const playlist = computed(() => store.medias)
const currentIndex = computed(() => store.currentIndex)

const onSelect = (index: number) => {
  store.playAt(index)
}

const onReorder = (payload: { from: number; to: number }) => {
  store.reorder(payload.from, payload.to)
}

const onRemove = (index: number) => {
  store.removeAt(index)
}

const onClear = () => {
  if (confirm('Вы уверены, что хотите очистить плейлист?')) {
    store.clearPlaylist()
  }
}
</script>

<template>
  <aside class="sidebar">
    <header class="sidebar-header">
      <h2>Плейлист</h2>
      <button type="button" class="clear-button" @click="onClear" :disabled="!playlist.length">
        <i class="pi pi-trash" />
        Очистить
      </button>
    </header>

    <div class="playlist" v-if="playlist.length">
      <SortableList
        :items="playlist"
        :active-index="currentIndex"
        @select="onSelect"
        @reorder="onReorder"
        @remove="onRemove"
      />
    </div>

    <div class="empty" v-else>
      Перетащите сюда видео или используйте кнопки сверху, чтобы начать.
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(10, 14, 25, 0.85);
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 1.25rem 1.1rem;
  color: #e2e8f0;
  max-height: 100%;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.clear-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fecaca;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.clear-button:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.7);
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.playlist {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.playlist::-webkit-scrollbar {
  width: 6px;
}

.playlist::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.35);
  border-radius: 999px;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.4;
  color: rgba(148, 163, 184, 0.75);
  padding: 1rem;
  border: 1px dashed rgba(99, 102, 241, 0.4);
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.08);
}

@media (max-width: 1024px) {
  .sidebar {
    flex-direction: row;
    align-items: stretch;
  }

  .playlist {
    max-height: 300px;
  }
}
</style>