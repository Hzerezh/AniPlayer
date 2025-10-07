export {}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }

  interface DataTransferItem {
    webkitGetAsEntry?: () => FileSystemEntry | null
  }

  interface FileSystemHandle {
    kind: 'file' | 'directory'
    name: string
  }

  interface FileSystemEntry {
    isFile: boolean
    isDirectory: boolean
    name: string
    fullPath?: string
  }

  interface FileSystemFileEntry extends FileSystemEntry {
    file(successCallback: (file: File) => void, errorCallback?: (err: DOMException) => void): void
  }

  interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader(): FileSystemDirectoryReader
  }

  interface FileSystemDirectoryReader {
    readEntries(successCallback: (entries: FileSystemEntry[]) => void, errorCallback?: (err: DOMException) => void): void
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>
    values(): AsyncIterableIterator<FileSystemHandle>
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>
  }
}