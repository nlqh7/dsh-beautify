# dsh-beautify

DeepSeek Harness 完整美化包：**本地主题换肤（不联网）+ Wallpaper Engine 动态壁纸 + 自定义主题**，一个插件搞定，设置页统一管理。

> All-in-one beautify plugin for DeepSeek Harness: local theme skins, Wallpaper Engine dynamic wallpapers, custom themes, persisted via localStorage.

## 功能

- **6 套本地主题**（不联网）：Codex 默认暗色 / Gothic Void Crusade / 桥本有菜·柔光玫瑰 / 晨雾山水 / 悟空 / DeepSeek-鲸鱼娘，壁纸 base64 本地打包
- **Wallpaper Engine 动态壁纸**：自动发现本机 WE 壁纸，渲染到界面后方，4 个滑块调节（壁纸模糊 / 暗化 / 边框 / 玻璃液态效果）
- **自定义主题**：壁纸 URL + 强调 / 背景 / 文字三色选色器，一键应用
- **持久化**：localStorage 保存（主题 + 遮罩强度 + 自定义），刷新即恢复
- **应用方式**：直接 `body` token 覆盖（DSH 美化插件的事实标准，非 theme 服务 hack），明暗模式走 DSH 内置
- **组件库架构**：`ui/` 可复用组件（Button/Slider）+ AI 可读组件契约，新增 UI 只能组合不能自由发明

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

重启 DSH → 打开**设置 → 外观**：明暗模式（跟随系统/浅色/深色）+ 主题网格（悬停预览壁纸）+ 壁纸遮罩强度滑块 + 自定义主题 + 壁纸引擎（选 WE 壁纸 + 4 滑块）。

## 来源与致谢

- 主题配色：来自 [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)（内置预设）与 [dreamskin.cc](https://dreamskin.cc) 社区主题库。
- Wallpaper Engine 桥接逻辑：vendored from [elysia395/dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine)（MIT）。

## Known Limitations and Deferred Work

- **localStorage 持久化**：不跨浏览器/设备（DSH settings 注册对第三方插件有已知坑，故用浏览器本地存储）。
- **皮肤是 body token 覆盖**：不参与 theme 服务 snapshot；明暗模式切换时自动重刷皮肤（内置兼容层）。
- **动态壁纸需要本机装 Wallpaper Engine**：未安装时壁纸引擎区块显示检测错误，其余功能不受影响。
- **女仆装素材（frames 液态玻璃边框 + 海洋背景）**：计划作为主题素材整合（v0.7）。
