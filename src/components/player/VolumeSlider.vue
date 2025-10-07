<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  muted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{ 'update:value': [value: number] }>()

const displayValue = computed({
  get: () => (props.muted ? 0 : props.value),
  set: (value: number) => {
    emit('update:value', value)
  },
})
</script>

<template>
  <label class="volume">
    <i
      :class="[
        'pi',
        displayValue <= 0 || props.muted
          ? 'pi-volume-off'
          : displayValue < 50
          ? 'pi-volume-down'
          : 'pi-volume-up',
      ]"
    ></i>
    <input v-model.number="displayValue" type="range" min="0" max="100" />
  </label>
</template>

<style scoped>
.volume {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(17, 24, 39, 0.65);
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  color: rgba(226, 232, 240, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.35);
}

.pi {
  font-size: 1rem;
}

input[type='range'] {
  width: 100px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(129, 140, 248, 0.9), rgba(56, 189, 248, 0.6));
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c4b5fd;
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c4b5fd;
}
</style>