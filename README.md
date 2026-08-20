# dsh-beautify

DeepSeek Harness 完整美化包：**本地主题换肤（不联网）+ Wallpaper Engine 动态壁纸 + 自定义主题**，一个插件搞定，设置页统一管理。

> All-in-one beautify plugin for DeepSeek Harness: local theme skins, Wallpaper Engine dynamic wallpapers, custom themes, persisted via localStorage.

## 功能

- **39 套主题**（不联网）：内置 3 + dreamskin.cc 社区 30 + 云鲸纸面·女仆装 + 深海女仆工坊 + 蓝色幻想/夕港/鲸吟/鲸语（dsh-web-ui 背景图），壁纸 base64 本地打包，网格默认显示前 8 套 +「查看全部」展开
- **氛围渐变背景**：无壁纸的主题按各自配色程序化生成光晕渐变背景（不占体积），全部主题都有背景效果，其中 36 套带真实壁纸图（晨雾/悟空/DeepSeek/女仆装/蓝色幻想/夕港/鲸吟/鲸语 + dreamskin.cc 社区 28 套，含 46 morning 4k/云上仙途/清透定制/miku-猛男版/雨过青瓷/SPIDER-MAN 等）
- **女仆装素材**：
  - maid-whale（云鲸纸面）：插画背景 + 明暗遮罩、mascot 吉祥物 + favicon、侧边栏海洋背景、全套 token 重映射、frames 液态玻璃九宫格边框（导航/输入框/对话框/菜单/面板/按钮/消息气泡）+ ornaments 手绘装饰（蝴蝶结/鲸鱼尾/泡泡等 8 件，跟随元素定位、宽窄屏自适应），明暗模式各有素材
  - maid-atelier（深海女仆工坊）：完整移植——宫殿背景（明暗各一）、双女仆角色立绘、侧边栏角饰 + mascot、标题栏品牌标识、工作区树装饰、favicon、专属 CSS（102KB 全作用域内联），明暗模式各有素材
- **Wallpaper Engine 动态壁纸**：自动发现本机 WE 壁纸，渲染到界面后方，4 个滑块调节（壁纸模糊 / 暗化 / 边框 / 玻璃液态效果），选择壁纸后显示预览缩略图
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
- 11 套社区主题壁纸图（46 morning 4k / 云上仙途 / 清透定制 / miku-猛男版 / 蓬松栗棕色长卷发小美女 / 雨过青瓷 / 好看户外治愈 / 202509061917596371 / art / SPIDER-MAN）：vendored from [dreamskin.cc](https://dreamskin.cc) 社区主题预览；桥本有菜 · 柔光玫瑰壁纸来自 [Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) 的 preset-arina-hashimoto。社区主题 License 为 All Rights Reserved，仅供个人本地使用。
- Wallpaper Engine 桥接逻辑：vendored from [elysia395/dsh-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine)（MIT）。
- 女仆装 frames/ornaments 素材与控制器：vendored from [yunxiiQwQ/dsh-maid-whale-webUI](https://github.com/yunxiiQwQ/dsh-maid-whale-webUI)。
- 深海女仆工坊皮肤（maid-atelier）素材与控制器：vendored from [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)，其素材按原项目许可（CC BY-NC-SA 4.0，原作者链：上善 → zipzip → Small-tailqwq）使用，仅作开源演示用途。
- 蓝色幻想 / 夕港 / 鲸吟 / 鲸语 主题背景图：vendored from [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui)（对应其 blue-fantasy / harbor / whale-song / whale-mom 皮肤）。

## Known Limitations and Deferred Work

- **localStorage 持久化**：不跨浏览器/设备（DSH settings 注册对第三方插件有已知坑，故用浏览器本地存储）。
- **皮肤是 body token 覆盖**：不参与 theme 服务 snapshot；明暗模式切换时自动重刷皮肤（内置兼容层）。
- **动态壁纸需要本机装 Wallpaper Engine**：未安装时壁纸引擎区块显示检测错误，其余功能不受影响；预览缩略图依赖 WE 项目的 preview 图，缺失时显示占位。
- **打包体积**：女仆装 + 深海女仆工坊 + 4 张 dsh-web-ui 背景图 + 28 套 dreamskin.cc 社区壁纸素材 base64 内嵌，client.js 约 10.5MB；只在对应主题激活时挂载 chrome，其他主题零开销。
