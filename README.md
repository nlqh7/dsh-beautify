# dsh-beautify

DeepSeek Harness 完整美化包：**本地主题换肤（不联网）+ Wallpaper Engine 动态壁纸 + 自定义主题 + 鲸鱼光标 + 余额小鲸鱼**，一个插件搞定，设置页统一管理。

> All-in-one beautify plugin for DeepSeek Harness: local theme skins, Wallpaper Engine dynamic wallpapers, custom themes, whale cursor, balance whale pet, persisted via localStorage.

## 功能

- **31 套主题**（不联网）：内置 + dreamskin.cc 社区 + 云鲸纸面·女仆装 + 深海女仆工坊 + 蓝色幻想/夕港/鲸语（dsh-web-ui 背景图），壁纸 base64 本地打包
- **氛围渐变背景**：无壁纸的主题按各自配色程序化生成光晕渐变背景
- **女仆装素材**：maid-whale（云鲸纸面）+ maid-atelier（深海女仆工坊）双皮肤，frames/ornaments/mascot 全量移植
- **Wallpaper Engine 动态壁纸**：自动发现本机 WE 壁纸，4 滑块调节（模糊/暗化/边框/玻璃）
- **自定义主题**：壁纸 URL + 强调/背景/文字三色选色器，一键应用（在「美化参数」里）
- **鲸鱼光标**：10 个形态（默认/链接/文本/忙碌/禁止/十字准星/背景/画笔/帮助/拖动）逐态开关——勾选 = 皮肤、取消 = 系统原光标；拖动默认用系统光标；摸头手型；自定义皮肤逐态上传
- **余额小鲸鱼**：显示 DeepSeek 余额、可摸头（按像素命中 + 叫声）、可拖动、右键菜单调大小/音量/记账模式
- **小小鲸鱼报数**：当前会话启用子代理时，一只小小鲸鱼对应一个子代理，逐个报到（叫声错开）、离开退场（叫声区分）、气泡报数；子代理声音独立开关
- **持久化**：localStorage 保存（主题/遮罩/光标配置/状态开关）
- **组件库架构**：`src/client/ui/` 可复用组件（Button/Knob/Segmented/Modal/Slider）

## 关键引用（Key References）

| 路径 | 说明 |
|---|---|
| `package.json` → `dsh.bundle.patch` | **DSH Hub 发布清单**：指向 `cordis.patch.yml`，声明插件的 loader 补丁入口 |
| `cordis.patch.yml` | Loader 补丁（entryListSchema）：`insert dsh-beautify`，DSH Hub 发布校验与安装入口 |
| `lib/index.js` | **服务端入口**：壁纸引擎发现、余额接口、小鲸鱼 widget 渲染、音效/图片/配置路由（`/dsh-whale/*`、`/dsh-beautify/status.json`） |
| `lib/client.js` | **浏览器端 bundle**：主题皮肤、光标、设置页（`@nlqh/dsh-beautify/client`，经 `dsh.client.inject` 挂载） |
| `assets/` | 小鲸鱼图（DSniang1.png）+ 4 个音效（Ya1/Ya2/D1/D2.mp3），摸头/拖动/报到/离开叫声 |
| `src/index.ts` | 服务端插件入口（webServer/credentials 注入） |
| `src/whale-widget.js` | 小鲸鱼挂件：余额气泡、摸头命中、拖动、菜单、小小鲸鱼生命周期与声音 |
| `src/client/index.ts` | 浏览器插件入口（theme/slots/workspaces/sessions 注入） |
| `src/client/whale-cursor.ts` | 鲸鱼光标控制器：逐态 gate、拖动检测、摸头手型 |
| `src/client/cursor-images.ts` | 10 态光标图 + 自定义皮肤上传存储 |
| `src/client/DreamSkinSettings.tsx` | 设置页「外观」区块：主题网格/壁纸引擎/光标/美化参数 |

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
      name: '@nlqh/dsh-beautify'
```

并确保包能从 profile 目录解析（`dsh plugin add` 会自动处理）。

## 使用

重启 DSH → 打开**设置 → 外观**：明暗模式（跟随系统/浅色/深色）+ 主题网格（悬停预览壁纸）+ 壁纸引擎 + 鼠标光标（总开关 + 10 态开关 + 大小 + 自定义皮肤上传）+ 美化参数（壁纸/玻璃/自定义主题）。
右下角小鲸鱼显示余额，可摸头、拖动、右键菜单。

## 来源与致谢

- 主题配色：来自 [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)（内置预设）与 [dreamskin.cc](https://dreamskin.cc) 社区主题库（社区主题 License 为 All Rights Reserved，仅供个人本地使用）。
- Wallpaper Engine 桥接逻辑：vendored from [elysia395/dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine)（MIT）。
- 女仆装 frames/ornaments 素材与控制器：vendored from [yunxiiQwQ/dsh-maid-whale-webUI](https://github.com/yunxiiQwQ/dsh-maid-whale-webUI)。
- 深海女仆工坊皮肤（maid-atelier）：vendored from [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)（CC BY-NC-SA 4.0）。
- 余额小鲸鱼挂件：vendored from [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget)（MIT，含 DSniang1.png 与音效）。

## Known Limitations and Deferred Work

- **localStorage 持久化**：不跨浏览器/设备。
- **皮肤是 body token 覆盖**：不参与 theme 服务 snapshot；明暗模式切换时自动重刷皮肤。
- **动态壁纸需要本机装 Wallpaper Engine**：未安装时壁纸引擎区块显示检测错误，其余功能不受影响。
- **打包体积**：女仆装 + 深海女仆工坊 + 社区壁纸素材 base64 内嵌，client.js 约 7.4MB；只在对应主题激活时挂载 chrome。
