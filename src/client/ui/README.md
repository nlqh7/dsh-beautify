# ui/ — 可复用基础组件

shadcn 哲学：组件是**自有源码**（copy-paste 可控），用 DSH 的 `--dsw-*` token 适配，
**不用 Tailwind、不写死色值、不引组件库**。新增功能 UI 只能组合这里的组件。

## 组件目录（AI 契约）

| 组件 | props | 用途 |
|---|---|---|
| `Button` | `children`, `onClick?`, `selected?`, `variant?`(`default`/`ghost`), `className?` | 带选中态的 token 按钮 |
| `Slider` | `value`, `min?`(0), `max?`(1), `step?`(0.01), `label`, `onChange` | token 滑块，值显示为百分比 |
| `Knob` | `label`, `value`, `min?`(0), `max?`(1), `step?`(0.01), `unit?`, `onChange`, `disabled?` | 带数字框+单位的滑块（外观行配方） |
| `Segmented` | `label`, `value`, `options`, `onSelect` | 等分发丝线框选择器，选中格带业务色 tint |

## AI 必须遵守的约束

1. 新 UI 只能**组合** `ui/` 组件，不能自由发明新的样式层。
2. 颜色只用 `--dsw-*` token（`var(--dsw-alias-*)`），禁止字面色值。
3. 组件 props 变更必须**同步更新本目录**（README + `index.ts` 的 `UI_CATALOG`）。
4. 一个功能一个文件，放 `features/`，不往 `ui/` 塞业务逻辑。
5. 拿不准改哪个组件时，先读 `UI_CATALOG`，不要凭记忆发明 props。
