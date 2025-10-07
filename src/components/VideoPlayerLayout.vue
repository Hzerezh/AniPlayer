<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '../stores/player'
import PlaylistSidebar from './playlist/PlaylistSidebar.vue'
import VideoControls from './player/VideoControls.vue'
import ContextMenu from './player/ContextMenu.vue'

const store = usePlayerStore()

const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const container = ref<HTMLDivElement | null>(null)

const currentVideo = computed(() => store.currentMedia)

const formattedTitle = computed(() => {
  if (!currentVideo.value) return 'Выберите видео'
  return currentVideo.value.displayName
})

const playbackRateOptions = computed(() => store.playbackRates)

const canSkipForward = computed(() => store.hasNext)
const canSkipBackward = computed(() => store.hasPrevious)

const handleFiles = async (files: FileList | File[]) => {
  await store.addFiles(Array.from(files))
}

const handleFolder = async (files: FileList | File[]) => {
  await store.addFolder(Array.from(files))
}

const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.items) {
    const filePromises = Array.from(event.dataTransfer.items).map(async (item) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (!file) return null
        return file
      }
      return null
    })
    const files = (await Promise.all(filePromises)).filter(
      (file): file is File => !!file,
    )
    if (files.length) {
      await handleFiles(files)
    }
  } else if (event.dataTransfer?.files) {
    await handleFiles(event.dataTransfer.files)
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  container.value?.classList.add('drag-hover')
}

const onDragLeave = (event: DragEvent) => {
  if (event.currentTarget === event.target) {
    container.value?.classList.remove('drag-hover')
  }
}

watch(
  currentVideo,
  (media) => {
    const video = videoElement.value
    if (!video || !media) return
    video.src = media.url
    video.currentTime = 0
    if (store.autoplay || store.justChangedTrack) {
      void video.play().catch(() => {
        /* ignore autoplay restrictions */
      })
    }
    store.setJustChangedTrack(false)
  },
  { immediate: true },
)

watch(
  () => store.isMuted,
  (muted) => {
    if (videoElement.value) {
      videoElement.value.muted = muted
    }
  },
  { immediate: true },
)

watch(
  () => store.playbackRate,
  (rate) => {
    if (videoElement.value) {
      videoElement.value.playbackRate = rate
    }
  },
  { immediate: true },
)

const onVideoEnded = () => {
  if (store.autoAdvance) {
    store.playNext()
  }
}

const onTimeUpdate = () => {
  if (!videoElement.value) return
  store.updateProgress(videoElement.value.currentTime, videoElement.value.duration)
}

const onLoadedMetadata = () => {
  if (!videoElement.value) return
  store.updateProgress(videoElement.value.currentTime, videoElement.value.duration)
}

const applySeek = (seconds: number) => {
  if (!videoElement.value) return
  store.seek(videoElement.value, seconds)
}

const onHotkey = (event: KeyboardEvent) => {
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    return
  }

  switch (event.key.toLowerCase()) {
    case ' ': // Space
    case 'k':
      event.preventDefault()
      store.togglePlay(videoElement.value)
      break
    case 'arrowleft':
      event.preventDefault()
      applySeek(-5)
      break
    case 'arrowright':
      event.preventDefault()
      applySeek(5)
      break
    case 'j':
      event.preventDefault()
      applySeek(-10)
      break
    case 'l':
      event.preventDefault()
      applySeek(10)
      break
    case 'm':
      event.preventDefault()
      store.toggleMute(videoElement.value)
      break
    case ',':
      event.preventDefault()
      if (videoElement.value) {
        store.seekByFrame(videoElement.value, 'backward')
      }
      break
    case '.':
      event.preventDefault()
      if (videoElement.value) {
        store.seekByFrame(videoElement.value, 'forward')
      }
      break
  }
}

const openFolderPicker = () => {
  folderInput.value?.click()
}

const openFilePicker = () => {
  fileInput.value?.click()
}

const requestPiP = async () => {
  if (!videoElement.value) return
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture().catch(() => undefined)
  } else {
    await videoElement.value.requestPictureInPicture().catch(() => undefined)
  }
}

const onContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  store.showContextMenu(event)
}

const showControls = ref(false)
let hideControlsTimeout: number | undefined

const handleMouseMove = () => {
  showControls.value = true
  clearTimeout(hideControlsTimeout)
  hideControlsTimeout = setTimeout(() => {
    showControls.value = false
  }, 3000)
}

const handleMouseLeave = () => {
  clearTimeout(hideControlsTimeout)
  showControls.value = false
}

const onCopyFrame = async () => {
  if (!videoElement.value) return
  await store.copyFrame(videoElement.value)
}

const onOpenContainingFolder = () => {
  store.openContainingFolder()
}

const onVolumeUpdate = (value: number) => {
  store.setVolume(value, videoElement.value)
}

const onFilesPicked = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  if (!input?.files) return
  void handleFiles(input.files)
  input.value = ''
}

const onFolderPicked = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  if (!input?.files) return
  void handleFolder(input.files)
  input.value = ''
}

onMounted(() => {
  document.addEventListener('keydown', onHotkey)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onHotkey)
})

const toggles = computed(() => [{
  label: 'Автопереход',
  model: computed({
    get: () => store.autoAdvance,
    set: (value: boolean) => store.setAutoAdvance(value),
  }),
}])
</script>

<template>
  <div
    ref="container"
    class="player-layout"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <section class="player-pane">
      <header class="player-header">
        <h1>AniPlayer · {{ formattedTitle }}</h1>
        <div class="header-actions">
          <button type="button" class="ghost" @click="openFilePicker">
            <i class="pi pi-plus"></i>
            Добавить файлы
          </button>
          <button type="button" class="ghost" @click="openFolderPicker">
            <i class="pi pi-folder-open"></i>
            Добавить папку
          </button>
          <button type="button" class="ghost" @click="requestPiP">
            <i class="pi pi-window-maximize"></i>
            PiP
          </button>
        </div>
      </header>

      <div
        class="video-wrapper"
        @contextmenu="onContextMenu"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <video
          ref="videoElement"
          class="video-player"
          crossorigin="anonymous"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onVideoEnded"
        ></video>
        <VideoControls
          v-show="showControls"
          :store="store"
          :video="videoElement"
          :playbackRates="playbackRateOptions"
          :can-skip-forward="canSkipForward"
          :can-skip-backward="canSkipBackward"
          @seek="applySeek"
          @copy-frame="onCopyFrame"
          @open-containing-folder="onOpenContainingFolder"
          @update-volume="onVolumeUpdate"
        />
      </div>

      <div class="toggles">
        <label v-for="toggle in toggles" :key="toggle.label" class="toggle">
          <span>{{ toggle.label }}</span>
          <input type="checkbox" v-model="toggle.model.value" />
        </label>
      </div>
    </section>

    <PlaylistSidebar />

    <input
      ref="fileInput"
      class="sr-only"
      type="file"
      accept="video/*"
      multiple
      @change="onFilesPicked"
    />

    <input
      ref="folderInput"
      class="sr-only"
      type="file"
      accept="video/*"
      webkitdirectory
      directory
      multiple
      @change="onFolderPicked"
    />
    <ContextMenu :video="videoElement" />
  </div>
</template>

<style scoped>
.player-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(25, 25, 35, 0.95), rgba(12, 12, 18, 0.98));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.player-layout.drag-hover {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.player-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.player-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.ghost {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.ghost:hover {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.7);
}

.ghost:active {
  transform: scale(0.97);
}

.ghost .pi {
  font-size: 1rem;
  color: rgba(129, 140, 248, 0.95);
}

.video-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(ellipse at center, rgba(30, 30, 40, 0.85), rgba(8, 8, 12, 0.95));
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.video-player {
  width: 100%;
  display: block;
  background: #000;
  max-height: 520px;
  aspect-ratio: 16 / 9;
}

.toggles {
  display: flex;
  gap: 0.75rem;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  padding: 0.45rem 0.75rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.toggle input[type='checkbox'] {
  accent-color: #6366f1;
  transform: scale(1.1);
}

@media (max-width: 1280px) {
  .player-layout {
    grid-template-columns: 1fr 320px;
  }
}

@media (max-width: 1024px) {
  .player-layout {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .player-layout {
    padding: 1rem;
  }

  .player-header h1 {
    font-size: 1.25rem;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>