import { openDB, type DBSchema } from 'idb'
import type { MediaItem } from './player'

interface MyDB extends DBSchema {
  playlist: {
    key: string
    value: { id: string; file: File }
  }
}

const dbPromise = openDB<MyDB>('aniplayer-db', 1, {
  upgrade(db) {
    db.createObjectStore('playlist', { keyPath: 'id' })
  },
})

export async function savePlaylist(playlist: MediaItem[]) {
  const db = await dbPromise
  const tx = db.transaction('playlist', 'readwrite')
  const store = tx.objectStore('playlist')
  await store.clear()
  for (const item of playlist) {
    await store.add({ id: item.id, file: item.file })
  }
  await tx.done
}

export async function loadPlaylist(): Promise<File[]> {
  const db = await dbPromise
  const items = await db.getAll('playlist')
  return items.map((item) => item.file)
}