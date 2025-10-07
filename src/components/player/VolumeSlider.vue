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
  <div class="volume-slider">
    <input v-model.number="displayValue" type="range" min="0" max="100" />
  </div>
</template>

<style scoped>
.volume-slider {
  display: inline-flex;
  align-items: center;
}

input[type='range'] {
  width: 100px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
  outline: none;
  transition: background 0.2s ease;
}

input[type='range']:hover {
  background: rgba(255, 255, 255, 0.6);
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c4b5fd;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c4b5fd;
  cursor: pointer;
}
</style>