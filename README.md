<img width="2559" height="1341" alt="image" src="https://github.com/user-attachments/assets/08dcdaec-67e3-4f8a-a2e5-cc93e85b431e" />

# dsh-beautify

给 DeepSeek Harness 换肤的插件：把 [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) 的**主题配色 + 壁纸背景**带进 DSH 的**原生主题系统**（`theme` service），不是 CSS 注入 hack。设置页一键切换，配色 + 壁纸即时生效。

> Vision for DeepSeek Harness UI: Codex-Dream-Skin color presets + wallpaper backgrounds registered on the native theme service, with a settings-page switcher.

## 功能

- **33 套主题配色**：3 套 Codex-Dream-Skin 内置 + 30 套 dreamskin.cc 社区精选（按下载量 + 收藏数排序取前 30）
- **20 套带壁纸背景**：下载量前 20 的主题内置壁纸（webp，压缩到 1280px），左侧渐变遮罩保证文字可读
- **原生主题系统**：每套主题用 `theme.register()` 注册为 DSH 主题，色表映射到 `--dsw-*` token，壁纸折叠进背景色 token
- **设置页切换**：设置 → Dream Skin，卡片 + 色块预览，点击即应用，一键「跟随系统」恢复
- **不碰 state 色**：错误/成功/警告色保持系统默认，任何主题下提示都清晰可读

## 安装

### 方式一：dsh plugin add

```sh
dsh plugin add "github:nlqh7/dsh-beautify"
```

### 方式二：手动挂载

在 profile 的 `cordis.patch.yml` 里加一行（client 插件必须用包名，不能用 file URL）：

```yaml
- insert:
    - id: dsh-beautify
      name: '@deepseek-ai/dsh-beautify'
```

并确保包能从 profile 目录解析（`dsh plugin add` 会自动处理）。

## 使用

重启 DSH → 打开**设置 → Dream Skin** → 点任意主题卡片，界面配色 + 壁纸即时切换。

## 主题列表

| 来源 | 数量 | 代表主题 |
|---|---|---|
| Codex-Dream-Skin 内置 | 3 | Codex 默认暗色、Gothic Void Crusade、桥本有菜·柔光玫瑰 |
| dreamskin.cc 社区（带壁纸） | 20 | 晨雾山水、悟空、DeepSeek-鲸鱼娘、露西、蕾塞、月下松岚、寂静星轨、森林、紫罗兰永恒花园、Claude EVA 暖奶油… |
| dreamskin.cc 社区（仅配色） | 10 | 灵感小宇宙、云上仙途、清透定制、雨过青瓷… |

## 来源与致谢

- 主题配色与壁纸来自 [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)（内置预设）和 [dreamskin.cc](https://dreamskin.cc)（社区主题库，经其公开 API 快照与 download 端点下载）。
- 壁纸经 ffmpeg 压缩到 1280px webp 后 base64 内嵌，未使用原项目的 Safe CSS 注入机制。

## Known Limitations and Deferred Work

- **后 10 套只有配色没有壁纸**：为控制包体积（client bundle 约 1.8MB），只给下载量前 20 的主题内置壁纸。
- **壁纸是压缩版**：1280px webp（非原图 4K 分辨率）。
- **主题切换不持久化**：`setTheme` 对第三方主题不写 settings scope，重启 DSH 后回到「跟随系统」。持久化偏好需在 Host 侧注册 settings 字段，属后续迭代。
