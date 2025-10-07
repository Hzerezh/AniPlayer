<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { usePlayerStore } from '../../stores/player'

const store = usePlayerStore()
const props = defineProps({
  video: {
    type: Object as PropType<HTMLVideoElement | null>,
    required: true,
  },
})

const contextMenu = computed(() => store.contextMenu)
const isVisible = computed(() => contextMenu.value.visible)
const position = computed(() => contextMenu.value.position)

const onCopyFrame = () => {
  if (!props.video) return
  store.copyFrame(props.video)
  store.hideContextMenu()
}

const hide = () => {
  store.hideContextMenu()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="context-menu-overlay" @click="hide" @contextmenu.prevent="hide">
      <ul
        class="context-menu"
        :style="{ top: `${position.y}px`, left: `${position.x}px` }"
      >
        <li @click="onCopyFrame">
          <i class="pi pi-copy" />
          <span>Копировать кадр</span>
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 999;
}
.context-menu {
  position: absolute;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  background: rgba(25, 25, 35, 0.98);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.55);
  z-index: 1000;
  min-width: 220px;
  color: #e2e8f0;
}
.context-menu li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  font-size: 0.95rem;
}
.context-menu li:hover {
  background: rgba(99, 102, 241, 0.2);
}
.context-menu .pi {
  font-size: 1rem;
}
</style>