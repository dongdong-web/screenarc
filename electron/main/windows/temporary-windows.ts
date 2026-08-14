// Logic to create temporary windows like countdown, saving, selection.

import { BrowserWindow } from 'electron'
import path from 'node:path'
import { appState } from '../state'
import { PRELOAD_SCRIPT, VITE_DEV_SERVER_URL, RENDERER_DIST } from '../lib/constants'

function createTemporaryWindow(options: Electron.BrowserWindowConstructorOptions, htmlPath: string) {
  // Define the path to the icon, handling both development and production environments
  const iconPath = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT!, 'public/screenarc-appicon.png')
    : path.join(RENDERER_DIST, 'screenarc-appicon.png')

  const win = new BrowserWindow({
    ...options,
    icon: iconPath, // Set the window icon here
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      // Keep standalone overlays isolated. The selection page uses the
      // contextBridge preload for its confirm/cancel IPC messages instead of
      // calling require('electron') from an untrusted renderer context.
      contextIsolation: true,
      nodeIntegration: false,
      ...options.webPreferences,
    },
  })

  const url = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT!, `public/${htmlPath}`)
    : path.join(RENDERER_DIST, htmlPath)

  win.loadFile(url)
  return win
}

export function createSavingWindow() {
  appState.savingWin = createTemporaryWindow({ width: 350, height: 200, show: false }, 'saving/index.html')

  // Only show the window once it's ready to avoid a white flash
  appState.savingWin.once('ready-to-show', () => {
    appState.savingWin?.show()
  })

  appState.savingWin.on('closed', () => {
    appState.savingWin = null
  })
}

export function createSelectionWindow() {
  const selectionWindow = createTemporaryWindow(
    { fullscreen: true, show: false, webPreferences: { preload: PRELOAD_SCRIPT } },
    'selection/index.html',
  )
  appState.selectionWin = selectionWindow

  selectionWindow.once('ready-to-show', () => {
    if (!selectionWindow.isDestroyed()) {
      selectionWindow.show()
      selectionWindow.focus()
    }
  })

  selectionWindow.on('closed', () => {
    appState.selectionWin = null
  })

  return selectionWindow
}
