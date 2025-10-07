<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import type { MediaItem } from '../../stores/player'

const props = defineProps({
  items: {
    type: Array as PropType<MediaItem[]>,
    required: true,
  },
  activeIndex: {
    type: Number,
    default: -1,
  },
})

const emit = defineEmits<{
  select: [index: number]
  remove: [index: number]
  'move-up': [index: number]
  'move-down': [index: number]
}>()
</script>

<template>
  <ul class="list">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="item"
      :data-active="index === activeIndex"
      @click="emit('select', index)"
      @dblclick="emit('select', index)"
    >
      <div class="meta">
        <img :src="item.thumbnail" class="thumbnail" alt="Video thumbnail" />
        <div class="info">
          <p class="title">{{ item.displayName }}</p>
          <p class="subtitle">{{ item.duration }} · {{ item.details }}</p>
        </div>
      </div>
      <div class="actions">
        <div class="sort-buttons">
          <button
            type="button"
            class="sort-button"
            :disabled="index === 0"
            @click.stop="emit('move-up', index)"
            title="Move Up"
          >
            <i class="pi pi-arrow-up" />
          </button>
          <button
            type="button"
            class="sort-button"
            :disabled="index === items.length - 1"
            @click.stop="emit('move-down', index)"
            title="Move Down"
          >
            <i class="pi pi-arrow-down" />
          </button>
        </div>
        <button
          type="button"
          class="delete-button"
          @click.stop="emit('remove', index)"
          title="Удалить"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.75rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.item[data-active='true'] {
  border-color: rgba(129, 140, 248, 1);
  background: rgba(99, 102, 241, 0.5);
  border-width: 2px;
  padding: calc(0.65rem - 1px);
  box-shadow: 0 12px 22px rgba(99, 102, 241, 0.2);
}

.item:active {
  transform: scale(0.99);
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.thumbnail {
  width: 64px;
  height: 36px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #000;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.8);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

.sort-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sort-button {
  width: 28px;
  height: 20px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.sort-button:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.sort-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>