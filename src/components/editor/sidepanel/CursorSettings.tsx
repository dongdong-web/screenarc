import { Pointer, Shadow, HandClick } from 'tabler-icons-react'
import { SparklesIcon } from '../../ui/icons'
import { Collapse } from '../../ui/collapse'
import { cn } from '../../../lib/utils'
import { useEffect, useState, useMemo } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import { useShallow } from 'zustand/react/shallow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Slider } from '../../ui/slider'
import { ColorPicker } from '../../ui/color-picker'
import { rgbaToHexAlpha, hexToRgb } from '../../../lib/utils'
import { DEFAULTS } from '../../../lib/constants'
import { EASING_MAP } from '../../../lib/easing'
import { Switch } from '../../ui/switch'
import { ControlGroup } from './ControlGroup'

const POST_PROCESSING_SCALES = [
  { value: 3, label: '3x' },
  { value: 2, label: '2x' },
  { value: 1.5, label: '1.5x' },
  { value: 1, label: '1x' },
]

const easingOptions = Object.keys(EASING_MAP)
const easingLabels: Record<string, string> = { Smooth: '平滑', Balanced: '均衡', Dynamic: '动态', Linear: '线性' }

export function CursorSettings() {
  const {
    platform,
    setPostProcessingCursorScale,
    cursorThemeName,
    setCursorThemeName,
    cursorStyles,
    updateCursorStyle,
  } = useEditorStore(
    useShallow((state) => ({
      platform: state.platform,
      setPostProcessingCursorScale: state.setPostProcessingCursorScale,
      cursorThemeName: state.cursorThemeName,
      setCursorThemeName: state.setCursorThemeName,
      cursorStyles: state.cursorStyles,
      updateCursorStyle: state.updateCursorStyle,
    })),
  )
  const { reloadCursorTheme } = useEditorStore.getState()
  const [cursorScale, setCursorScale] = useState<number>(DEFAULTS.CURSOR.SCALE.defaultValue)
  const [availableThemes, setAvailableThemes] = useState<string[]>([DEFAULTS.CURSOR.THEME.defaultValue])

  const isCustomizationSupported = useMemo(() => platform === 'win32' || platform === 'darwin', [platform])

  useEffect(() => {
    if (isCustomizationSupported) {
      window.electronAPI.getCursorThemes().then((themes) => {
        if (themes && themes.length > 0) {
          setAvailableThemes(themes)
        }
      })

      window.electronAPI.getSetting<number>('recorder.cursorScale').then((savedScale) => {
        if (savedScale && POST_PROCESSING_SCALES.some((s) => s.value === savedScale)) {
          setCursorScale(savedScale)
        }
      })
    }
  }, [isCustomizationSupported])

  const handleCursorScaleChange = (value: number) => {
    setCursorScale(value)
    setPostProcessingCursorScale(value)
  }

  const handleThemeChange = (themeName: string) => {
    setCursorThemeName(themeName)
    reloadCursorTheme(themeName)
  }

  const { hex: shadowHex, alpha: shadowAlpha } = useMemo(
    () => rgbaToHexAlpha(cursorStyles.shadowColor),
    [cursorStyles.shadowColor],
  )
  const { hex: rippleHex, alpha: rippleAlpha } = useMemo(
    () => rgbaToHexAlpha(cursorStyles.clickRippleColor),
    [cursorStyles.clickRippleColor],
  )

  const handleShadowColorChange = (newHex: string) => {
    const rgb = hexToRgb(newHex)
    if (rgb) {
      const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowAlpha})`
      updateCursorStyle({ shadowColor: newRgbaColor })
    }
  }

  const handleShadowOpacityChange = (newAlpha: number) => {
    const rgb = hexToRgb(shadowHex)
    if (rgb) {
      const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${newAlpha})`
      updateCursorStyle({ shadowColor: newRgbaColor })
    }
  }

  const handleRippleColorChange = (newHex: string) => {
    const rgb = hexToRgb(newHex)
    if (rgb) {
      const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rippleAlpha})`
      updateCursorStyle({ clickRippleColor: newRgbaColor })
    }
  }

  const handleRippleOpacityChange = (newAlpha: number) => {
    const rgb = hexToRgb(rippleHex)
    if (rgb) {
      const newRgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${newAlpha})`
      updateCursorStyle({ clickRippleColor: newRgbaColor })
    }
  }

  const handleResetTheme = () => {
    if (isCustomizationSupported) handleThemeChange(DEFAULTS.CURSOR.THEME.defaultValue)
  }

  const handleResetSize = () => {
    if (isCustomizationSupported) handleCursorScaleChange(DEFAULTS.CURSOR.SCALE.defaultValue)
  }

  const handleResetShadow = () => {
    updateCursorStyle({
      shadowBlur: DEFAULTS.CURSOR.SHADOW.BLUR.defaultValue,
      shadowOffsetX: DEFAULTS.CURSOR.SHADOW.OFFSET_X.defaultValue,
      shadowOffsetY: DEFAULTS.CURSOR.SHADOW.OFFSET_Y.defaultValue,
      shadowColor: DEFAULTS.CURSOR.SHADOW.DEFAULT_COLOR_RGBA,
    })
  }

  const handleResetClickEffects = () => {
    updateCursorStyle({
      clickRippleEffect: DEFAULTS.CURSOR.CLICK_RIPPLE.ENABLED.defaultValue,
      clickRippleColor: DEFAULTS.CURSOR.CLICK_RIPPLE.COLOR.defaultValue,
      clickRippleSize: DEFAULTS.CURSOR.CLICK_RIPPLE.SIZE.defaultValue,
      clickRippleDuration: DEFAULTS.CURSOR.CLICK_RIPPLE.DURATION.defaultValue,
      clickScaleEffect: DEFAULTS.CURSOR.CLICK_SCALE.ENABLED.defaultValue,
      clickScaleAmount: DEFAULTS.CURSOR.CLICK_SCALE.AMOUNT.defaultValue,
      clickScaleDuration: DEFAULTS.CURSOR.CLICK_SCALE.DURATION.defaultValue,
      clickScaleEasing: DEFAULTS.CURSOR.CLICK_SCALE.EASING.defaultValue,
    })
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Pointer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">光标设置</h2>
            <p className="text-sm text-muted-foreground">调整成片中的光标外观</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto stable-scrollbar">
        <ControlGroup label="显示">
          <div className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border">
            <span className="text-sm font-medium text-sidebar-foreground">显示光标</span>
            <Switch
              checked={cursorStyles.showCursor}
              onCheckedChange={(v) => updateCursorStyle({ showCursor: v })}
              className="data-[state=on]:bg-primary"
            />
          </div>
        </ControlGroup>
        <Collapse
          title="光标主题"
          description="更改视频中的光标样式"
          icon={<Pointer className="w-4 h-4 text-primary" />}
          defaultOpen={true}
          onReset={isCustomizationSupported ? handleResetTheme : undefined}
        >
          <div className="space-y-3">
            <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">主题</label>
            <Select
              value={isCustomizationSupported ? cursorThemeName : 'Default'}
              onValueChange={handleThemeChange}
              disabled={!isCustomizationSupported}
            >
              <SelectTrigger className="h-10 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableThemes.map((theme) => (
                  <SelectItem key={theme} value={theme} className="capitalize">
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isCustomizationSupported && (
              <p className="text-xs text-muted-foreground pt-1">光标主题仅在 Windows 和 macOS 上可用。</p>
            )}
          </div>
        </Collapse>
        <Collapse
          title="光标大小"
          description="更改成片中的光标大小"
          icon={<Pointer className="w-4 h-4 text-primary" />}
          defaultOpen={true}
          onReset={isCustomizationSupported ? handleResetSize : undefined}
        >
          <div className="space-y-3">
            <label className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">缩放</label>
            <div
              className={cn(
                'grid grid-cols-4 gap-1 p-1 rounded-lg',
                !isCustomizationSupported ? 'opacity-50 cursor-not-allowed' : 'bg-muted/50',
              )}
            >
              {POST_PROCESSING_SCALES.map((scale) => (
                <button
                  key={scale.value}
                  onClick={!isCustomizationSupported ? undefined : () => handleCursorScaleChange(scale.value)}
                  disabled={!isCustomizationSupported}
                  className={cn(
                    'py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    cursorScale === scale.value
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                    !isCustomizationSupported && 'cursor-not-allowed hover:text-muted-foreground',
                  )}
                >
                  {scale.label}
                </button>
              ))}
            </div>
            {!isCustomizationSupported && (
              <p className="text-xs text-muted-foreground pt-1">
                虚拟光标大小仅在 Windows 和 macOS 上可用。
              </p>
            )}
          </div>
        </Collapse>
        <Collapse
          title="点击效果"
          description="为鼠标点击添加视觉反馈"
          icon={<HandClick className="w-4 h-4 text-primary" />}
          defaultOpen={false}
          onReset={handleResetClickEffects}
        >
          <div className="space-y-6">
            <ControlGroup
              label="点击波纹"
              icon={<SparklesIcon className="w-4 h-4 text-primary/80" />}
              description="点击时出现扩散圆环效果。"
            >
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between w-full">
                  <label
                    htmlFor="click-ripple-effect"
                    className={`text-sm font-medium ${!cursorStyles.clickRippleEffect ? 'text-muted-foreground' : 'text-foreground/80'}`}
                  >
                    显示
                  </label>
                  <Switch
                    id="click-ripple-effect"
                    checked={cursorStyles.clickRippleEffect}
                    onCheckedChange={(v) => updateCursorStyle({ clickRippleEffect: v })}
                  />
                </div>
                <div className={`space-y-4 ${!cursorStyles.clickRippleEffect ? 'opacity-70' : ''}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">大小（半径）</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        {cursorStyles.clickRippleSize}px
                      </span>
                    </div>
                    <Slider
                      disabled={!cursorStyles.clickRippleEffect}
                      min={DEFAULTS.CURSOR.CLICK_RIPPLE.SIZE.min}
                      max={DEFAULTS.CURSOR.CLICK_RIPPLE.SIZE.max}
                      step={DEFAULTS.CURSOR.CLICK_RIPPLE.SIZE.step}
                      value={cursorStyles.clickRippleSize}
                      onChange={(v) => updateCursorStyle({ clickRippleSize: v })}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">时长</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        {cursorStyles.clickRippleDuration.toFixed(2)}s
                      </span>
                    </div>
                    <Slider
                      disabled={!cursorStyles.clickRippleEffect}
                      min={DEFAULTS.CURSOR.CLICK_RIPPLE.DURATION.min}
                      max={DEFAULTS.CURSOR.CLICK_RIPPLE.DURATION.max}
                      step={DEFAULTS.CURSOR.CLICK_RIPPLE.DURATION.step}
                      value={cursorStyles.clickRippleDuration}
                      onChange={(v) => updateCursorStyle({ clickRippleDuration: v })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ColorPicker
                        label="颜色"
                        value={rippleHex}
                        onChange={handleRippleColorChange}
                        disabled={!cursorStyles.clickRippleEffect}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">不透明度</span>
                        <span className="text-xs font-semibold text-primary tabular-nums">
                          {Math.round(rippleAlpha * 100)}%
                        </span>
                      </div>
                      <Slider
                        disabled={!cursorStyles.clickRippleEffect}
                        min={0}
                        max={1}
                        step={0.01}
                        value={rippleAlpha}
                        onChange={handleRippleOpacityChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ControlGroup>
            <ControlGroup
              label="点击缩放"
              icon={<Pointer className="w-4 h-4 text-primary/80" />}
              description="点击时出现轻微缩放动画。"
            >
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between w-full">
                  <label
                    htmlFor="click-scale-effect"
                    className={`text-sm font-medium ${!cursorStyles.clickScaleEffect ? 'text-muted-foreground' : 'text-foreground/80'}`}
                  >
                    显示
                  </label>
                  <Switch
                    id="click-scale-effect"
                    checked={cursorStyles.clickScaleEffect}
                    onCheckedChange={(v) => updateCursorStyle({ clickScaleEffect: v })}
                  />
                </div>
                <div className={`space-y-4 ${!cursorStyles.clickScaleEffect ? 'opacity-70' : ''}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">缩放幅度</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        {cursorStyles.clickScaleAmount.toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      disabled={!cursorStyles.clickScaleEffect}
                      min={DEFAULTS.CURSOR.CLICK_SCALE.AMOUNT.min}
                      max={DEFAULTS.CURSOR.CLICK_SCALE.AMOUNT.max}
                      step={DEFAULTS.CURSOR.CLICK_SCALE.AMOUNT.step}
                      value={cursorStyles.clickScaleAmount}
                      onChange={(v) => updateCursorStyle({ clickScaleAmount: v })}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">时长</span>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        {cursorStyles.clickScaleDuration.toFixed(2)}s
                      </span>
                    </div>
                    <Slider
                      disabled={!cursorStyles.clickScaleEffect}
                      min={DEFAULTS.CURSOR.CLICK_SCALE.DURATION.min}
                      max={DEFAULTS.CURSOR.CLICK_SCALE.DURATION.max}
                      step={DEFAULTS.CURSOR.CLICK_SCALE.DURATION.step}
                      value={cursorStyles.clickScaleDuration}
                      onChange={(v) => updateCursorStyle({ clickScaleDuration: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={cn(
                        'text-sm',
                        !cursorStyles.clickScaleEffect ? 'text-muted-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      过渡风格
                    </label>
                    <Select
                      disabled={!cursorStyles.clickScaleEffect}
                      value={cursorStyles.clickScaleEasing}
                      onValueChange={(v) => updateCursorStyle({ clickScaleEasing: v })}
                    >
                      <SelectTrigger
                        className={cn('h-10', !cursorStyles.clickScaleEffect ? 'bg-background/30' : 'bg-background/50')}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((easing) => (
                          <SelectItem key={easing} value={easing}>
                            {easingLabels[easing] || easing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ControlGroup>
          </div>
        </Collapse>
        <Collapse
          title="光标阴影"
          description="添加投影以提高可见性"
          icon={<Shadow className="w-4 h-4 text-primary" />}
          defaultOpen={false}
          onReset={handleResetShadow}
        >
          <div className="space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">模糊</span>
                <span className="text-xs font-semibold text-primary tabular-nums">{cursorStyles.shadowBlur}px</span>
              </div>
              <Slider
                disabled={!cursorStyles.showCursor}
                min={DEFAULTS.CURSOR.SHADOW.BLUR.min}
                max={DEFAULTS.CURSOR.SHADOW.BLUR.max}
                step={DEFAULTS.CURSOR.SHADOW.BLUR.step}
                value={cursorStyles.shadowBlur}
                onChange={(v) => updateCursorStyle({ shadowBlur: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">水平偏移</span>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {cursorStyles.shadowOffsetX}px
                  </span>
                </div>
                <Slider
                  disabled={!cursorStyles.showCursor}
                  min={DEFAULTS.CURSOR.SHADOW.OFFSET_X.min}
                  max={DEFAULTS.CURSOR.SHADOW.OFFSET_X.max}
                  step={DEFAULTS.CURSOR.SHADOW.OFFSET_X.step}
                  value={cursorStyles.shadowOffsetX}
                  onChange={(v) => updateCursorStyle({ shadowOffsetX: v })}
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">垂直偏移</span>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {cursorStyles.shadowOffsetY}px
                  </span>
                </div>
                <Slider
                  disabled={!cursorStyles.showCursor}
                  min={DEFAULTS.CURSOR.SHADOW.OFFSET_Y.min}
                  max={DEFAULTS.CURSOR.SHADOW.OFFSET_Y.max}
                  step={DEFAULTS.CURSOR.SHADOW.OFFSET_Y.step}
                  value={cursorStyles.shadowOffsetY}
                  onChange={(v) => updateCursorStyle({ shadowOffsetY: v })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ColorPicker
                  label="颜色"
                  value={shadowHex}
                  onChange={handleShadowColorChange}
                  disabled={!cursorStyles.showCursor}
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">不透明度</span>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {Math.round(shadowAlpha * 100)}%
                  </span>
                </div>
                <Slider
                  disabled={!cursorStyles.showCursor}
                  min={DEFAULTS.CURSOR.SHADOW.OPACITY.min}
                  max={DEFAULTS.CURSOR.SHADOW.OPACITY.max}
                  step={DEFAULTS.CURSOR.SHADOW.OPACITY.step}
                  value={shadowAlpha}
                  onChange={handleShadowOpacityChange}
                />
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  )
}
