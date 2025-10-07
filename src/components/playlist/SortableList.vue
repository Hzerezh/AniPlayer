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
  reorder: [{ from: number; to: number }]
}>()

const draggingIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

const onDragStart = (index: number) => {
  draggingIndex.value = index
}

const onDragEnter = (index: number) => {
  overIndex.value = index
}

const onDragEnd = () => {
  draggingIndex.value = null
  overIndex.value = null
}

const onDrop = (index: number) => {
  if (draggingIndex.value === null) return
  emit('reorder', { from: draggingIndex.value, to: index })
  draggingIndex.value = null
  overIndex.value = null
}

watch(
  () => props.items,
  () => {
    draggingIndex.value = null
    overIndex.value = null
  },
)
</script>

<template>
  <ul class="list">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="item"
      :data-active="index === activeIndex"
      :data-dragging="index === draggingIndex"
      :data-over="index === overIndex"
      draggable
      @click="emit('select', index)"
      @dragstart="onDragStart(index)"
      @dragenter.prevent="onDragEnter(index)"
      @dragend="onDragEnd"
      @dragover.prevent
      @drop.prevent="onDrop(index)"
    >
      <div class="meta">
        <span class="order">{{ index + 1 }}</span>
        <div class="info">
          <p class="title">{{ item.displayName }}</p>
          <p class="subtitle">{{ item.details }}</p>
        </div>
      </div>
      <i class="pi pi-grip-vertical"></i>
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
  cursor: grab;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.item[data-active='true'] {
  border-color: rgba(99, 102, 241, 0.75);
  background: rgba(99, 102, 241, 0.25);
  box-shadow: 0 12px 22px rgba(99, 102, 241, 0.2);
}

.item[data-dragging='true'] {
  opacity: 0.4;
}

.item[data-over='true'] {
  border-style: dashed;
  border-color: rgba(148, 163, 184, 0.6);
}

.item:active {
  cursor: grabbing;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.order {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(79, 70, 229, 0.5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
}

.subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.8);
}

.pi {
  color: rgba(148, 163, 184, 0.7);
}
</style>