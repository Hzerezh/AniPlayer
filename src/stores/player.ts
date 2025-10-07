import { computed, reactive } from 'vue'
import { defineStore } from 'pinia'

const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',
  'video/matroska',
  'video/x-msvideo',
  'video/avi',
  'video/hevc',
  'video/h265',
  'video/x-hevc',
  'video/vnd.dlna.mpeg-tts',
  'video/mp2t',
  'video/x-flv',
]

let uid = 0

export interface MediaItem {
  id: string
  file: File
  url: string
  displayName: string
  details: string
}

export interface PlayerStore {
  readonly medias: MediaItem[]
  readonly currentIndex: number
  readonly currentMedia: MediaItem | null
  readonly formattedCurrentTime: string
  readonly formattedDuration: string
  readonly progress: number
  readonly playbackRates: number[]
  readonly isPlaying: boolean
  readonly isMuted: boolean
  readonly autoAdvance: boolean
  readonly hasNext: boolean
  readonly hasPrevious: boolean
  readonly playbackRate: number
  readonly autoplay: boolean
  readonly volume: number
  justChangedTrack: boolean
  readonly contextMenu: {
    visible: boolean
    position: { x: number; y: number }
  }
  addFiles(files: File[]): Promise<void>
  addFolder(files: File[]): Promise<void>
  playAt(index: number): void
  playNext(): void
  playPrevious(): void
  reorder(from: number, to: number): void
  togglePlay(video?: HTMLVideoElement | null): void
  toggleMute(video?: HTMLVideoElement | null): void
  setPlaybackRate(rate: number, video?: HTMLVideoElement | null): void
  updateProgress(currentTime: number, duration: number): void
  seek(video: HTMLVideoElement, seconds: number): void
  seekToPercentage(video: HTMLVideoElement | null, percentage: number): void
  setAutoAdvance(value: boolean): void
  setAutoplay(value: boolean): void
  setMuted(value: boolean): void
  setVolume(value: number, video?: HTMLVideoElement | null): void
  setPlaying(value: boolean): void
  updateCurrentIndex(index: number): void
  showContextMenu(event: MouseEvent): void
  hideContextMenu(): void
  copyFrame(video: HTMLVideoElement): Promise<void>
  openContainingFolder(): void
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const time = [hrs, mins, secs]
    .filter((value, index) => value !== 0 || index > 0)
    .map((value) => value.toString().padStart(2, '0'))
  return (hrs > 0 ? time : [mins.toString().padStart(2, '0'), secs.toString().padStart(2, '0')]).join(':')
}

export const usePlayerStore = defineStore('player', (): PlayerStore => {
  const state = reactive({
    medias: [] as MediaItem[],
    currentIndex: -1,
    isPlaying: false,
    isMuted: false,
    autoAdvance: true,
    autoplay: true,
    playbackRate: 1,
    volume: 80,
    progress: 0,
    duration: 0,
    currentTime: 0,
    contextMenu: {
      visible: false,
      position: { x: 0, y: 0 },
    },
  })

  const playbackRates = [
    0.25, 0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3,
  ]

  const currentMedia = computed(() => state.medias[state.currentIndex] ?? null)

  const hasNext = computed(() => state.currentIndex < state.medias.length - 1)
  const hasPrevious = computed(() => state.currentIndex > 0)

  const formattedDuration = computed(() => formatTime(state.duration))
  const formattedCurrentTime = computed(() => formatTime(state.currentTime))

  const addFiles = async (files: File[]) => {
    const filtered = files.filter((file) => {
      if (!file.type) return true
      return SUPPORTED_FORMATS.some((type) => file.type === type)
    })

    const additions = filtered.map((file): MediaItem => {
      const displayName = file.name
      const details = `${Math.round(file.size / (1024 * 1024))} МБ`
      return {
        id: `media-${uid++}`,
        file,
        url: URL.createObjectURL(file),
        displayName,
        details,
      }
    })

    if (additions.length) {
      state.medias.push(...additions)
      if (state.currentIndex === -1) {
        state.currentIndex = 0
        state.isPlaying = true
      }
    }
  }

  const addFolder = async (files: File[]) => {
    await addFiles(files)
  }

  const playAt = (index: number) => {
    if (index < 0 || index >= state.medias.length) return
    state.currentIndex = index
    state.isPlaying = true
    store.justChangedTrack = true
  }

  const playNext = () => {
    if (hasNext.value) {
      playAt(state.currentIndex + 1)
    }
  }

  const playPrevious = () => {
    if (hasPrevious.value) {
      playAt(state.currentIndex - 1)
    }
  }

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const [item] = state.medias.splice(from, 1)
    if (!item) return
    state.medias.splice(to, 0, item)
    if (state.currentIndex === from) {
      state.currentIndex = to
    } else if (from < state.currentIndex && to >= state.currentIndex) {
      state.currentIndex -= 1
    } else if (from > state.currentIndex && to <= state.currentIndex) {
      state.currentIndex += 1
    }
  }

  const togglePlay = (video?: HTMLVideoElement | null) => {
    if (!video) {
      state.isPlaying = !state.isPlaying
      return
    }
    if (video.paused) {
      void video.play()
      state.isPlaying = true
    } else {
      video.pause()
      state.isPlaying = false
    }
  }

  const toggleMute = (video?: HTMLVideoElement | null) => {
    state.isMuted = !state.isMuted
    if (video) {
      video.muted = state.isMuted
    }
  }

  const setPlaybackRate = (rate: number, video?: HTMLVideoElement | null) => {
    state.playbackRate = rate
    if (video) {
      video.playbackRate = rate
    }
  }

  const updateProgress = (currentTime: number, duration: number) => {
    state.currentTime = currentTime
    state.duration = duration
    if (!Number.isFinite(duration) || duration <= 0) {
      state.progress = 0
    } else {
      state.progress = (currentTime / duration) * 100
    }
  }

  const seek = (video: HTMLVideoElement, seconds: number) => {
    const target = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0)
    video.currentTime = target
    updateProgress(target, video.duration)
  }

  const seekToPercentage = (video: HTMLVideoElement | null, percentage: number) => {
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
    const target = (percentage / 100) * video.duration
    video.currentTime = target
    updateProgress(target, video.duration)
  }

  const setAutoAdvance = (value: boolean) => {
    state.autoAdvance = value
  }

  const setAutoplay = (value: boolean) => {
    state.autoplay = value
  }

  const setMuted = (value: boolean) => {
    state.isMuted = value
  }

  const setVolume = (value: number, video?: HTMLVideoElement | null) => {
    state.volume = Math.max(0, Math.min(100, value))
    const volumeValue = state.volume / 100
    if (video) {
      video.volume = volumeValue
      if (state.isMuted && volumeValue > 0) {
        state.isMuted = false
        video.muted = false
      }
    }
  }

  const setPlaying = (value: boolean) => {
    state.isPlaying = value
  }

  const updateCurrentIndex = (index: number) => {
    state.currentIndex = index
  }

  const contextMenu = reactive({
    visible: false,
    position: { x: 0, y: 0 },
  })

  const showContextMenu = (event: MouseEvent) => {
    contextMenu.visible = true
    contextMenu.position = { x: event.clientX, y: event.clientY }
  }

  const hideContextMenu = () => {
    contextMenu.visible = false
  }

  const copyFrame = async (video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    } catch (error) {
      console.error('Не удалось скопировать кадр:', error)
    }
  }

  const openContainingFolder = () => {
    if (!currentMedia.value) return
    const url = URL.createObjectURL(currentMedia.value.file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = currentMedia.value.file.name
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const store: PlayerStore = {
    get medias() {
      return state.medias
    },
    get currentIndex() {
      return state.currentIndex
    },
    get currentMedia() {
      return currentMedia.value
    },
    get formattedCurrentTime() {
      return formattedCurrentTime.value
    },
    get formattedDuration() {
      return formattedDuration.value
    },
    get progress() {
      return state.progress
    },
    get playbackRates() {
      return playbackRates
    },
    get isPlaying() {
      return state.isPlaying
    },
    get isMuted() {
      return state.isMuted
    },
    get autoAdvance() {
      return state.autoAdvance
    },
    get hasNext() {
      return hasNext.value
    },
    get hasPrevious() {
      return hasPrevious.value
    },
    get playbackRate() {
      return state.playbackRate
    },
    get autoplay() {
      return state.autoplay
    },
    get volume() {
      return state.volume
    },
    justChangedTrack: false,
    get contextMenu() {
      return contextMenu
    },
    addFiles,
    addFolder,
    playAt,
    playNext,
    playPrevious,
    reorder,
    togglePlay,
    toggleMute,
    setPlaybackRate,
    updateProgress,
    seek,
    seekToPercentage,
    setAutoAdvance,
    setAutoplay,
    setMuted,
    setVolume,
    setPlaying,
    updateCurrentIndex,
    showContextMenu,
    hideContextMenu,
    copyFrame,
    openContainingFolder,
  }

  return store
})