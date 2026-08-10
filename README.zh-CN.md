# ScreenArc（简体中文）🎬

[English](README.md) | 简体中文

> 这是 [ScreenArc](https://github.com/tamnguyenvan/screenarc) 的中文说明与社区 Fork。ScreenArc 用鼠标移动和点击轨迹自动生成平移、缩放等镜头效果，让录屏更接近产品演示或教程视频，而不必手工逐帧打关键帧。

<div align="center">
  <img src="https://raw.githubusercontent.com/tamnguyenvan/screenarc/main/docs/assets/small-banner.png" alt="ScreenArc 横幅">
</div>

![演示视频](https://github.com/tamnguyenvan/screenarc/blob/main/docs/assets/screenarc-demo.gif?raw=true)

## 适合谁

- 做软件教程、产品演示、编程讲解的创作者
- 需要把长横屏录制快速裁成 16:9、9:16 或 1:1 的创作者
- 希望在录屏中加入摄像头画面、背景、圆角和阴影的人
- 想从开源项目开始改进录屏工作流的开发者

## 核心功能

- **灵活录制**：支持全屏、单窗口和自定义区域，并支持多显示器。
- **摄像头叠加**：可在录制中加入摄像头画面。
- **鼠标跟随镜头**：根据鼠标移动与点击自动生成平滑的平移、缩放效果。
- **时间线编辑**：可裁剪片段，调整画幅、背景颜色/渐变/壁纸和阴影。
- **一键适配比例**：16:9（横版视频）、9:16（短视频）和 1:1。
- **预设**：保存常用视觉风格，快速复用。
- **导出**：可导出 MP4 或 GIF，最高支持 2K。

## 当前 Fork 的状态

这个 Fork 的第一项改进是为 **Windows 打包发布** 增加原生模块验证：构建安装包时会检查 `global-mouse-events` 和 `node-win-cursor` 及其编译后的 `.node` 文件是否真的被带进安装包。缺失这些模块会导致鼠标跟踪、点击驱动的自动缩放不可用。

这是一道发布前质量门禁，不是现成的 Windows 修复安装包。当前 Fork 还没有独立发布的新安装包；请不要把未经 `npm run verify:win-package` 验证的 Windows 构建分发给其他人。

## 安装与使用

### 普通用户

独立安装包发布后会出现在本 Fork 的 [Releases 页面](https://github.com/dongdong-web/screenarc/releases)。在此之前，请使用下方的开发者方式运行，或自行从可信来源获取上游发布版本。

### Windows 安全提示

开源应用若没有代码签名证书，Windows 可能会显示 SmartScreen 或下载安全提示。不要因为提示而直接运行未知文件；应确认下载来源、检查仓库和发布说明，并优先使用可复现构建或可信发布者提供的安装包。

### Linux

ScreenArc 当前依赖 **X11**，不支持 Wayland。可以在终端执行 `echo $XDG_SESSION_TYPE` 检查会话类型；若显示 `wayland`，请在登录界面切换到 X11。

发布 AppImage 后，可执行：

```bash
chmod +x ScreenArc-*-linux-x64.AppImage
./ScreenArc-*-linux-x64.AppImage
```

### macOS

请根据芯片下载 arm64（Apple Silicon）或 x64（Intel）版本。未签名或未公证的应用会被 macOS 拦截；应只从可信发布页获取，并在“系统设置 → 隐私与安全性”中确认应用来源后再运行。

## 开发环境

### 前置条件

- Node.js 18–22
- **Windows**：Visual Studio 2022 Build Tools（勾选“使用 C++ 的桌面开发”）和 Python 3.8。
- **macOS**：Xcode Command Line Tools 和 Python 3.8。
- **Linux**：X11 会话。

### 运行步骤

1. 克隆本 Fork：

   ```bash
   git clone https://github.com/dongdong-web/screenarc.git
   cd screenarc
   ```

2. 安装依赖：

   ```bash
   npm ci
   ```

3. 准备 FFmpeg：从 [screenarc-assets](https://github.com/tamnguyenvan/screenarc-assets/releases/tag/v0.0.1) 下载对应平台的可执行文件，并放到 `binaries/[os]` 目录。

4. 启动开发模式：

   ```bash
   npm run dev
   ```

## 构建 Windows 安装包

Windows 的鼠标轨迹依赖原生模块。准备发布安装包前必须先构建，再检查安装包内容：

```bash
npm run rebuild:win-native
npm run dist:win
npm run verify:win-package
```

第一条命令会按 Electron 的 ABI 重新编译 Windows 原生模块。第三条命令会在下列情形失败：

- `global-mouse-events` 或 `node-win-cursor` 未被打进包中；
- 相关模块没有对应的已编译 `.node` 二进制文件；
- 未找到符合预期的 Windows 解包资源目录。

只有验证通过的构建才应进入实际录屏测试、签名和发布流程。

### 在 GitHub Actions 中运行 Windows 诊断构建

在 `fix/windows-native-package-verification` 验证分支上，每次推送都会自动运行这个 **Windows Package Diagnostic** 工作流。当工作流合入默认分支后，也可以在 **Actions** 选项卡中手动触发。它会构建 Windows 安装包、验证原生模块，并上传保留 7 天的测试安装包 Artifact；不会创建 Git 标签或 GitHub Release。

## 参与贡献

- 遇到问题或有功能想法，请先在 [Issues](https://github.com/dongdong-web/screenarc/issues) 中描述复现步骤和预期结果。
- 代码改动请使用描述明确的分支，运行 `npm run lint` 和 `npm test` 后再提交。
- 如果希望把改动贡献回上游，可从本 Fork 的分支向 `tamnguyenvan/screenarc` 发起 Pull Request；原作者会独立决定是否合并。

## 致谢

感谢上游 [tamnguyenvan/screenarc](https://github.com/tamnguyenvan/screenarc) 及其贡献者，也感谢以下项目提供底层能力：

- [global-mouse-events](https://github.com/xanderfrangos/global-mouse-events)
- [node-x11](https://github.com/sidorares/node-x11)
- [Cursorful](https://cursorful.com/)

## 许可证

本项目及此 Fork 使用 [GPL-3.0](LICENSE) 许可证。你可以使用、修改和再发布代码，但分发修改版本时需遵守 GPL-3.0 的许可与源码提供要求，并保留适用的版权和许可证声明。
