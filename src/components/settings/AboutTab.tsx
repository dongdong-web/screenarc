import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { BrandGithub } from 'tabler-icons-react'

export function AboutTab() {
  const [appVersion, setAppVersion] = useState('...')

  useEffect(() => {
    // Fetch the app version from the main process
    window.electronAPI.getVersion().then((version) => {
      setAppVersion(version)
    })
  }, [])

  const openLink = (url: string) => {
    window.electronAPI.openExternal(url)
  }

  return (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
      <img src="media://screenarc-appicon.png" alt="ScreenArc Logo" className="w-24 h-24 mb-4 rounded-3xl shadow-lg" />
      <h2 className="text-2xl font-bold text-foreground">ScreenArc</h2>
      <p className="text-sm text-muted-foreground mb-6">版本 {appVersion}</p>

      <div className="text-sm text-foreground space-y-2">
        <p>由 Tam Nguyen 用心制作。</p>
        <p>一款简洁而强大的现代录屏和视频编辑工具。</p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button variant="secondary" onClick={() => openLink('https://github.com/tamnguyenvan/screenarc')}>
          <BrandGithub className="w-4 h-4 mr-2" />
          GitHub 项目主页
        </Button>
      </div>

      <p className="absolute bottom-4 text-xs text-muted-foreground">基于 Electron、React 和 TypeScript 构建。</p>
    </div>
  )
}
