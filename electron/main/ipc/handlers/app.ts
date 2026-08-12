import { app, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log/main'
import { appState } from '../../state'

export function handleGetPath(_event: IpcMainInvokeEvent, name: 'home' | 'userData' | 'desktop') {
  return app.getPath(name)
}

export function handleGetVersion() {
  return app.getVersion()
}

export function handleGetPlatform() {
  return process.platform
}

export function minimizeWindow(event: IpcMainEvent) {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.minimize()
}

export function maximizeWindow(event: IpcMainEvent) {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window?.isMaximized()) {
    window.unmaximize()
  } else {
    window?.maximize()
  }
}

export function closeWindow(event: IpcMainEvent) {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.close()
}

export function recorderClickThrough(event: IpcMainEvent) {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.setIgnoreMouseEvents(true, { forward: true })
  setTimeout(() => {
    window?.setIgnoreMouseEvents(false)
  }, 100)
}

export function handleIsMaximized(event: IpcMainInvokeEvent): boolean {
  const window = BrowserWindow.fromWebContents(event.sender)
  return window?.isMaximized() ?? false
}

export function updateTitleBarOverlay(_event: IpcMainEvent, options: { color: string; symbolColor: string }) {
  if (process.platform !== 'win32') return

  const editorWindow = appState.editorWin
  if (editorWindow && !editorWindow.isDestroyed()) {
    editorWindow.setTitleBarOverlay(options)
  }
}

export function sendProjectToEditor(event: IpcMainEvent) {
  const editorWindow = BrowserWindow.fromWebContents(event.sender)
  const session = appState.currentEditorSessionFiles

  if (editorWindow !== appState.editorWin || !session) {
    log.warn('[EditorWindow] Ignored project request from a non-editor window or without a recording session.')
    return
  }

  log.info('[EditorWindow] Renderer is ready. Sending project data.')
  event.sender.send('project:open', {
    videoPath: session.screenVideoPath,
    metadataPath: session.metadataPath,
    webcamVideoPath: session.webcamVideoPath,
  })
}
