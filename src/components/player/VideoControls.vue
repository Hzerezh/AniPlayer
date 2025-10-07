<script setup lang="ts">
import { computed, type PropType, ref, watch } from 'vue'
import type { PlayerStore } from '../../stores/player'
import VolumeSlider from './VolumeSlider.vue'

const props = defineProps({
  store: {
    type: Object as PropType<PlayerStore>,
    required: true,
  },
  video: {
    type: Object as PropType<HTMLVideoElement | null>,
    required: true,
  },
  playbackRates: {
    type: Array as PropType<number[]>,
    required: true,
  },
  canSkipForward: {
    type: Boolean,
    default: false,
  },
  canSkipBackward: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  seek: [seconds: number]
  'copy-frame': []
  'open-containing-folder': []
  'update-volume': [value: number]
}>()

const formattedCurrentTime = computed(() => props.store.formattedCurrentTime)
const formattedDuration = computed(() => props.store.formattedDuration)
const progress = computed(() => props.store.progress)

const playbackRate = computed({
  get: () => props.store.playbackRate,
  set: (value: number) => props.store.setPlaybackRate(value, props.video ?? undefined),
})

const showContextMenu = ref(false)

const onSkip = (seconds: number) => {
  emit('seek', seconds)
}

const onTogglePlay = () => {
  props.store.togglePlay(props.video ?? undefined)
}

const onMute = () => {
  props.store.toggleMute(props.video ?? undefined)
}

const onVolumeChange = (value: number) => {
  emit('update-volume', value)
}

const onProgressInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number.parseFloat(target.value)
  props.store.seekToPercentage(props.video ?? null, value)
}

const onCopyFrame = () => emit('copy-frame')
const onOpenContainingFolder = () => emit('open-containing-folder')

watch(
  () => props.store.contextMenu.visible,
  (visible) => {
    showContextMenu.value = visible
  },
)

const contextPosition = computed(() => props.store.contextMenu.position)
</script>

<template>
  <section class="controls">
    <div class="timeline">
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        :value="progress"
        @input="onProgressInput"
      />
      <div class="time-info">
        <span>{{ formattedCurrentTime }}</span>
        <span>{{ formattedDuration }}</span>
      </div>
    </div>

    <div class="seek-buttons">
        <button type="button" @click="onSkip(-80)">
        <i class="pi pi-angle-double-left"></i>
        -1:20
      </button>
      <button type="button" @click="onSkip(-30)">
        <i class="pi pi-angle-left"></i>
        -30с
      </button>
      <button type="button" @click="onSkip(-10)">
        <i class="pi pi-step-backward"></i>
        -10с
      </button>
      <button type="button" @click="onSkip(-5)">
        <i class="pi pi-caret-left"></i>
        -5с
      </button>
      <button type="button" class="primary" @click="onTogglePlay">
        <i :class="props.store.isPlaying ? 'pi pi-pause' : 'pi pi-play'" />
      </button>
      <button type="button" @click="onSkip(5)">
        <i class="pi pi-caret-right"></i>
        +5с
      </button>
      <button type="button" @click="onSkip(10)">
        <i class="pi pi-step-forward"></i>
        +10с
      </button>
      <button type="button" @click="onSkip(30)">
        <i class="pi pi-angle-right"></i>
        +30с
      </button>
      <button type="button" @click="onSkip(80)">
        <i class="pi pi-angle-double-right"></i>
        +1:20
      </button>
    </div>

    <div class="bottom">
      <div class="playback">
        <button type="button" class="icon" @click="onMute">
          <i :class="props.store.isMuted ? 'pi pi-volume-off' : 'pi pi-volume-up'" />
        </button>
        <VolumeSlider
          :value="props.store.volume"
          :muted="props.store.isMuted"
          @update:value="onVolumeChange"
        />
        <button
          type="button"
          class="icon"
          :disabled="!canSkipBackward"
          @click="props.store.playPrevious()"
        >
          <i class="pi pi-skip-backward" />
        </button>
        <button
          type="button"
          class="icon"
          :disabled="!canSkipForward"
          @click="props.store.playNext()"
        >
          <i class="pi pi-skip-forward" />
        </button>

        <select v-model.number="playbackRate">
          <option v-for="option in playbackRates" :key="option" :value="option">
            {{ option.toFixed(2) }}x
          </option>
        </select>
      </div>

      <div class="secondary">
        <button type="button" class="icon" @click="onCopyFrame">
          <i class="pi pi-copy" />
        </button>
        <button type="button" class="icon" @click="onOpenContainingFolder">
          <i class="pi pi-folder" />
        </button>
      </div>
    </div>

    <Transition name="fade">
      <ul
        v-if="showContextMenu"
        class="context-menu"
        :style="{ top: `${contextPosition.y}px`, left: `${contextPosition.x}px` }"
        @click="props.store.hideContextMenu()"
      >
        <li @click="onOpenContainingFolder">Открыть папку с файлом</li>
        <li @click="onCopyFrame">Копировать кадр</li>
      </ul>
    </Transition>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(12, 17, 28, 0.85);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1 0%, rgba(99, 102, 241, 0.1) 100%);
  outline: none;
  cursor: pointer;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a855f7;
  border: 2px solid #c4b5fd;
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a855f7;
  border: 2px solid #c4b5fd;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.95);
}

.seek-buttons {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.6rem;
}

.seek-buttons button {
  padding: 0.65rem 0.4rem;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(76, 29, 149, 0.35);
  color: #e9d5ff;
  font-size: 0.82rem;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.seek-buttons button:hover {
  border-color: rgba(129, 140, 248, 0.6);
  background: rgba(79, 70, 229, 0.45);
}

.seek-buttons button:active {
  transform: translateY(1px);
}

.seek-buttons button.primary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.95));
  border-color: rgba(59, 130, 246, 0.7);
  color: #f8fafc;
  font-weight: 600;
}

.seek-buttons button.primary:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 1));
}

.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.playback {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(30, 27, 75, 0.65);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: rgba(191, 219, 254, 0.95);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon:not(:disabled):hover {
  transform: translateY(-1px);
  background: rgba(30, 64, 175, 0.85);
}

select {
  background: rgba(17, 24, 39, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.45);
  border-radius: 10px;
  padding: 0.35rem 0.75rem;
  color: #e0e7ff;
  font-weight: 500;
  cursor: pointer;
}

.context-menu {
  position: absolute;
  list-style: none;
  margin: 0;
  padding: 0.4rem 0;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.55);
  z-index: 40;
  min-width: 220px;
}

.context-menu li {
  padding: 0.65rem 1rem;
  cursor: pointer;
  color: rgba(226, 232, 240, 0.95);
}

.context-menu li:hover {
  background: rgba(59, 130, 246, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .seek-buttons {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .playback {
    justify-content: space-between;
  }

  .secondary {
    justify-content: flex-end;
  }
}
</style>