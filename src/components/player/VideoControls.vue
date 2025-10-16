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
  'update-volume': [value: number]
}>()

const formattedCurrentTime = computed(() => props.store.formattedCurrentTime)
const formattedDuration = computed(() => props.store.formattedDuration)
const progress = computed(() => props.store.progress)

const playbackRate = computed({
  get: () => props.store.playbackRate,
  set: (value: number) => props.store.setPlaybackRate(value, props.video ?? undefined),
})

const autoAdvance = computed({
  get: () => props.store.autoAdvance,
  set: (value: boolean) => props.store.setAutoAdvance(value),
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
    </div>
    <div class="actions-bar">
      <div class="group left">
        <div class="volume-control">
          <button type="button" class="icon" @click="onMute">
            <i :class="props.store.isMuted ? 'pi pi-volume-off' : 'pi pi-volume-up'" />
          </button>
          <VolumeSlider
            :value="props.store.volume"
            :muted="props.store.isMuted"
            @update:value="onVolumeChange"
          />
        </div>
        <div class="time-info">
          <span>{{ formattedCurrentTime }}</span>
          <span>/</span>
          <span>{{ formattedDuration }}</span>
        </div>
      </div>
      <div class="group center">
        <button
          type="button"
          class="icon"
          :disabled="!canSkipBackward"
          @click="props.store.playPrevious()"
        >
          <i class="pi pi-backward" />
        </button>
        <button type="button" class="icon seek-btn" @click="onSkip(-30)">
          <i class="pi pi-replay" />
        </button>
        <button type="button" class="primary play-btn" @click="onTogglePlay">
          <i :class="props.store.isPlaying ? 'pi pi-pause' : 'pi pi-play'" />
        </button>
        <button type="button" class="icon seek-btn" @click="onSkip(30)">
          <i class="pi pi-forward" />
        </button>
        <button
          type="button"
          class="icon"
          :disabled="!canSkipForward"
          @click="props.store.playNext()"
        >
          <i class="pi pi-forward" />
        </button>
      </div>
      <div class="group right">
        <label class="toggle">
          <input type="checkbox" v-model="autoAdvance" />
          <span>Автопереход</span>
        </label>
        <select v-model.number="playbackRate">
          <option v-for="option in playbackRates" :key="option" :value="option">
            {{ option.toFixed(2) }}x
          </option>
        </select>
      </div>
    </div>
  </section>
</template>

<style scoped>
.controls {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem 1.5rem 0.75rem;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: opacity 0.3s ease;
}
.timeline {
  display: flex;
  width: 100%;
}
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  transition: height 0.2s ease;
}
input[type='range']:hover {
  height: 6px;
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
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.group.left {
  flex: 1;
  justify-content: flex-start;
}
.group.center {
  flex: 0 1 auto;
  justify-content: center;
}
.group.right {
  flex: 1;
  justify-content: flex-end;
}
.icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.icon:hover {
  background: rgba(255, 255, 255, 0.2);
}
.icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.primary.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.primary.play-btn:hover {
  transform: scale(1.05);
}
.seek-btn i {
  font-size: 1.2rem;
}
.time-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #f1f5f9;
  min-width: 90px;
}
select {
  background: transparent;
  border: none;
  color: #e0e7ff;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
}
select:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}
.volume-control .icon {
  position: relative;
  z-index: 1;
}
.volume-control:hover > :deep(.volume-slider) {
  width: 120px;
  opacity: 1;
  transform: translateX(0);
  pointer-events: all;
}
:deep(.volume-slider) {
  width: 0;
  opacity: 0;
  transform: translateX(-20px);
  pointer-events: none;
  transition: width 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  margin-left: -20px;
  padding-left: 20px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #e2e8f0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
}
.toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.toggle input[type='checkbox'] {
  accent-color: #818cf8;
}
</style>