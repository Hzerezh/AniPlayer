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
    <div class="seek-buttons">
      <button type="button" @click="onSkip(-80)">-1:20</button>
      <button type="button" @click="onSkip(-30)">-30с</button>
      <button type="button" @click="onSkip(-10)">-10с</button>
      <button type="button" @click="onSkip(-5)">-5с</button>
      <button type="button" class="primary" @click="onTogglePlay">
        <i :class="props.store.isPlaying ? 'pi pi-pause' : 'pi pi-play'" />
      </button>
      <button type="button" @click="onSkip(5)">+5с</button>
      <button type="button" @click="onSkip(10)">+10с</button>
      <button type="button" @click="onSkip(30)">+30с</button>
      <button type="button" @click="onSkip(80)">+1:20</button>
    </div>
    <div class="bottom">
      <div class="playback">
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
      <div class="secondary">
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
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 1rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  transition: opacity 0.3s ease;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
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

.time-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #f1f5f9;
}

.seek-buttons {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.seek-buttons button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #f1f5f9;
  padding: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.seek-buttons button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.seek-buttons button.primary {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  font-size: 1.2rem;
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
  width: 40px;
  height: 40px;
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

.primary {
  width: 40px;
  height: 40px;
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

.primary:hover {
  transform: scale(1.05);
}

select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  color: #e0e7ff;
  font-weight: 500;
  cursor: pointer;
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
</style>