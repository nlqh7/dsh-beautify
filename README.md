# @nlqh/dsh-beautify

> DSH 社区插件 · 一站式美化包：鲸鱼光标 / 子代理小鲸鱼 / 29 套主题 / 自定义皮肤 / 声音与设置

[![npm version](https://img.shields.io/badge/version-0.2.1-blue)](#) [![bundle](https://img.shields.io/badge/bundle-3.6MB-success)](#) [![license](https://img.shields.io/badge/license-CC--BY--NC--SA--4.0-orange)](#license)

每个子代理都是一只**独立、完整、可互动**的小鲸鱼，分布在主鲸鱼周围；主鲸鱼本身可拖动、摸头、换皮；29 套主题、10 态光标，所有声音可独立控制。

![3 只子代理小鲸鱼 + 报到气泡](docs/screenshots/01-three-babies.png)

---

## ✨ 核心亮点

### 🐳 子代理小鲸鱼 — 每只都是完整插件

![5 只子代理 + 主鲸鱼 + 碰撞推开](docs/screenshots/04-five-babies.png)

| 特性 | 说明 |
|---|---|
| **1:1 生命周期** | 每个子代理 = 一份完整小鲸鱼；子代理入场→小鲸鱼出现，离场→小鲸鱼离开（带"呱"声） |
| **错开报到** | 同时到达时逐只跳出来（间隔 ~170ms），每只"叽"一声叫，气泡显示「N 只小小鲸鱼报到」 |
| **可单独拖动** | 按住任意一只拖到屏幕任意位置，**自动吸附墙壁**（贴左/右/上/下） |
| **可单独摸头** | 鼠标放上去立刻变**系统手型**（grab），hover/拖动有叫声 |
| **碰撞体积** | 松手时与主鲸鱼/其他小鲸鱼重叠自动沿最小位移方向弹开，**永不重叠** |
| **手动锁定** | 拖过的位置保持不动，主鲸鱼移动时其他自动重排不影响它 |
| **独立声音开关** | 菜单里可单独关掉子代理叫声，不影响主鲸鱼 |
| **点击 ≠ 拖动** | "摸一下"不会触发吸附/锁定（位移 < 5px 视为点击） |

### 🖱️ 鲸鱼光标 — 10 种状态逐态可控

10 种状态：默认箭头 / 链接手型 / 文本 / 忙碌 / 禁止 / 十字准星 / 背景 / 画笔 / 帮助 / **拖动**

- **拖动默认用系统原光标**（grabbing 手感最自然）
- 摸头（hover 主鲸鱼）→ 立刻恢复系统手型
- 状态开关里可单独把每态切回皮肤
- 自定义皮肤：可上传 10 张图分别覆盖各态

### 🎨 29 套主题（已瘦身）

悟空 / 晨雾山水 / 夕港 / 橘子洲头 / 人民的 AI / 芙宁娜 / Reze / Firefly / DeepSeek / miku / 女仆系列 / 云鲸纸面 / 大肥鱼 / claude-eva / dream-* ……

- 内置 + 暗/亮双套
- WE（Wallpaper Engine）桥接：装本机 WE 后，**用各自电脑的 WE 壁纸，不占包体积**
- 自定义主题：可上传壁纸+调 7 个参数

### 🦢 海鸭女仆工坊（vendored）

水墨山水背景 + 候鸟女仆角色，提供暗色 / 亮色两套皮肤。

- 聊天界面女仆**缩小靠边**（64vh），不挡内容
- **轨迹 / 新会话**等非聊天视图自动隐藏女仆（避免遮挡）

### 🔊 声音系统

| 声音 | 开关 |
|---|---|
| 主鲸鱼摸头/拖动 press / release | 总音效开关 + 音量 |
| 子代理报到/离开 cry | **子代理声音独立开关** |
| 用量气泡（令牌模式） | 用量模式切换 |
| 4 个音效包可选 | 小黄鸭 / fx1（菜单下拉） |

### ⚙️ 设置体验

- 设置弹窗跟随**主题自身明暗**（不是宿主偏好），暗色主题下弹窗也是深色
- 鼠标光标开关修复：关闭后再次打开，皮肤**一定可见**（自动恢复 default 态）
- 拖动光标大小 24–64px

---

## 📸 截图场景说明

| 文件 | 场景 |
|---|---|
| `01-three-babies.png` | 3 只子代理到达 → 报到气泡 + 竖排小鲸鱼 |
| `04-five-babies.png` | 5 只子代理 + 主鲸鱼被拖到左侧 + 碰撞推开效果 |
| `02-after-collision.png` | 拖一只到另一只身上 → 自动弹开不重叠 |
| `03-pet-cursor.png` | 摸头时系统手型（grab） |

---

## 🔑 Key References（关键引用）

发布到 DSH Hub 需要这些文件齐全，DSH Hub 在安装时会读取它们：

| 引用 | 位置 | 作用 |
|---|---|---|
| 包清单 | [`package.json`](package.json) | `name: @nlqh/dsh-beautify`、`dsh.bundle.patch` 声明 |
| **发布协议** | [`cordis.patch.yml`](cordis.patch.yml) | 顶层 YAML 数组，`insert` 声明本包要注入的 loader 条目（`name: @nlqh/dsh-beautify`） |
| 服务端入口 | [`lib/index.js`](lib/index.js) | Cordis loader 看到的服务端插件实现（路由、loader） |
| 浏览器端 | [`lib/client.js`](lib/client.js) | 浏览器端 apply 入口（注入主题 / 光标 / 设置 / 子代理监听） |
| 鲸鱼脚本 | [`src/whale-widget.js`](src/whale-widget.js) | 主鲸鱼 + 小鲸鱼 widget（拖动、吸附、碰撞、气泡、声音） |
| 主题 | [`src/client/themes.ts`](src/client/themes.ts) | 29 套 DreamSkin 预设 |
| 壁纸 | [`src/client/wallpapers.ts`](src/client/wallpapers.ts) | 内嵌壁纸 base64（瘦身后 ~1.7MB） |
| 光标 | [`src/client/cursor-images.ts`](src/client/cursor-images.ts) | 10 态光标图 |
| 声音 | [`assets/Ya*.mp3`](assets/) / [`assets/D*.mp3`](assets/) | 主鲸鱼（Ya1/Ya2）+ 子代理（D1/D2）音效 |
| 角色图 | [`assets/DSniang1.png`](assets/) | 主鲸鱼 + baby 共用图（透明背景、完整角色） |

发布校验：DSH Hub 读 `dsh.bundle.patch` → 解析 `cordis.patch.yml`（entryListSchema：顶层数组）→ 校验 `insert[].name` 与 `package.json#name` 一致。

---

## 🚀 安装

DSH Hub 搜索 **`@nlqh/dsh-beautify`** → 安装即用，无需配置。

安装后：
- 屏幕右下角出现主鲸鱼
- 启动子代理 → 自动出现对应小鲸鱼
- 设置 → 外观 → 主题/光标/声音

---

## 🛠️ 本地开发

```bash
git clone https://github.com/nlqh7/dsh-beautify.git
cd dsh-beautify
pnpm install
pnpm dsh web   # 需要在 DSH harness monorepo 内
```

**小贴士**：WorkBuddy 环境下 `git push` 会被 `helper-selector` 卡住，用环境变量 `GITHUB_TOKEN` + URL 内嵌绕过：
```bash
git -c credential.helper= push "https://x-access-token:${GITHUB_TOKEN}@github.com/nlqh7/dsh-beautify.git" master
```

---

## 📜 License & Credits

**License**: CC BY-NC-SA 4.0

**Credits**:
- [MeteorNOX/DeepSeek-Balance-Whale-Widget](https://github.com/MeteorNOX/DeepSeek-Balance-Whale-Widget) — 余额显示与鲸鱼 UI 灵感
- [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) — 海鸭女仆工坊皮肤（vendored, CC BY-NC-SA）
- 角色立绘：DSniang1.png（CC BY-NC-SA）
- DSH 社区 @nlqh7 制作维护
