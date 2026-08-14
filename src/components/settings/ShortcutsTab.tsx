import React from 'react'

const ShortcutItem = ({ keys, description }: { keys: string[]; description: string }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-foreground">{description}</p>
      <div className="flex items-center gap-1.5">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded-md border border-border">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="text-sm text-muted-foreground">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function ShortcutsTab() {
  const shortcutCategories = [
    {
      title: '播放',
      shortcuts: [
        { keys: ['Space'], description: '播放 / 暂停' },
        { keys: ['J'], description: '上一帧' },
        { keys: ['K'], description: '下一帧' },
        { keys: ['←'], description: '后退 1 秒' },
        { keys: ['→'], description: '前进 1 秒' },
      ],
    },
    {
      title: '编辑',
      shortcuts: [
        { keys: ['Cmd/Ctrl', 'Z'], description: '撤销' },
        { keys: ['Cmd/Ctrl', 'Y'], description: '重做' },
        { keys: ['Cmd/Ctrl', 'Shift', 'Z'], description: '重做' },
        { keys: ['Delete'], description: '删除片段' },
        { keys: ['Backspace'], description: '删除片段' },
      ],
    },
    {
      title: '通用',
      shortcuts: [
        { keys: ['F'], description: '切换全屏' },
        { keys: ['Esc'], description: '退出全屏 / 取消选择' },
      ],
    },
  ]

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-foreground mb-6">快捷键</h2>

      <div className="space-y-6">
        {shortcutCategories.map((category) => (
          <div key={category.title}>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{category.title}</h3>
            <div className="divide-y divide-border rounded-lg border border-border bg-muted/30 px-4">
              {category.shortcuts.map((shortcut) => (
                <ShortcutItem key={shortcut.description} keys={shortcut.keys} description={shortcut.description} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
