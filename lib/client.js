window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-dream-skin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/wallpapers.ts
		const WALLPAPERS = {
			"morning-mist": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/morning-mist.webp",
				focusX: .78,
				focusY: .5
			},
			"cecilylove002": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/cecilylove002.webp",
				focusX: .5,
				focusY: .5
			},
			"lucy-moon": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/lucy-moon.webp",
				focusX: .5,
				focusY: .5
			},
			"moonlit-pine": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/moonlit-pine.webp",
				focusX: .82,
				focusY: .42
			},
			"wukong": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/wukong.webp",
				focusX: 0,
				focusY: .5
			},
			"dreamskin-2560x1440": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/dreamskin-2560x1440.webp",
				focusX: .28,
				focusY: .5
			},
			"deepseek": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/deepseek.webp",
				focusX: .5,
				focusY: .5
			},
			"mikuu-full-background": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/mikuu-full-background.webp",
				focusX: .5,
				focusY: .5
			},
			"poster": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/poster.webp",
				focusX: .5,
				focusY: .5
			},
			"reze": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/reze.webp",
				focusX: .5,
				focusY: .5
			},
			"firefly": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/firefly.webp",
				focusX: .08,
				focusY: .5
			},
			"juzizhoutou": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/juzizhoutou.webp",
				focusX: .5,
				focusY: .5
			},
			"republic": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/republic.webp",
				focusX: .55,
				focusY: .5
			},
			"111": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/111.webp",
				focusX: .67,
				focusY: .78
			},
			"quiet-orbit": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/quiet-orbit.webp",
				focusX: .76,
				focusY: .5
			},
			"123456": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/123456.webp",
				focusX: 0,
				focusY: .5
			},
			"idea-engine": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/idea-engine.webp",
				focusX: .5,
				focusY: .5
			},
			"forest": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/forest.webp",
				focusX: .5,
				focusY: .5
			},
			"violet-evergarden": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/violet-evergarden.webp",
				focusX: .5,
				focusY: .45
			},
			"claude-eva-warm": {
				url: "https://raw.githubusercontent.com/nlqh7/dsh-dream-skin/master/wallpapers/claude-eva-warm.webp",
				focusX: .44,
				focusY: .38
			}
		};
		//#endregion
		//#region src/client/themes.ts
		/** Convert a hex color to rgba with the given alpha; non-hex values pass through. */
		function hexToRgba(color, alpha) {
			const hex = /^#([0-9a-fA-F]{6})/.exec(color)?.[1];
			if (hex === void 0) return color;
			return `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}, ${alpha})`;
		}
		/** Map a Dream Skin palette onto the DSW alias tokens, folding in the wallpaper. */
		function toTokens(id, p) {
			const wallpaper = WALLPAPERS[id];
			return {
				"--dsw-alias-bg-base": wallpaper !== void 0 ? `linear-gradient(90deg, ${hexToRgba(p.background, .72)} 0%, ${hexToRgba(p.background, .42)} 38%, ${hexToRgba(p.background, .06)} 66%, transparent 84%), url("${wallpaper.url}") ${Math.round(wallpaper.focusX * 100)}% ${Math.round(wallpaper.focusY * 100)}% / cover no-repeat` : p.background,
				"--dsw-alias-bg-layer-1": p.panel,
				"--dsw-alias-bg-layer-2": p.panelAlt,
				"--dsw-alias-bg-overlay": p.panelAlt,
				"--dsw-alias-border-l1": p.line,
				"--dsw-alias-border-l2": p.line,
				"--dsw-alias-brand-primary": p.accent,
				"--dsw-alias-label-primary": p.text,
				"--dsw-alias-label-secondary": p.muted,
				"--dsw-specific-sidebar-fill": p.panel
			};
		}
		function preset(id, label, colorScheme, palette) {
			return {
				id,
				label,
				definition: Object.freeze({
					id,
					colorScheme,
					tokens: Object.freeze(toTokens(id, palette))
				}),
				swatches: Object.freeze([
					palette.background,
					palette.accent,
					palette.text
				]),
				...WALLPAPERS[id] === void 0 ? {} : { wallpaper: WALLPAPERS[id] }
			};
		}
		/** Shipped presets, in display order. */
		const DREAM_SKIN_PRESETS = Object.freeze([
			preset("dream-codex", "Codex 默认暗色", "dark", {
				background: "#111318",
				panel: "#191c22",
				panelAlt: "#20242b",
				accent: "#8298a3",
				accentAlt: "#a0adb3",
				secondary: "#8da397",
				highlight: "#9d94a3",
				text: "#edf0f1",
				muted: "#a3aaae",
				line: "rgba(130, 152, 163, .24)"
			}),
			preset("dream-gothic", "Gothic Void Crusade", "dark", {
				background: "#0d0d0e",
				panel: "#171513",
				panelAlt: "#211d18",
				accent: "#c8a55a",
				accentAlt: "#e3c27a",
				secondary: "#74352e",
				highlight: "#8a2f27",
				text: "#f3ead7",
				muted: "#b5a386",
				line: "rgba(200, 165, 90, .28)"
			}),
			preset("dream-arina", "桥本有菜 · 柔光玫瑰", "dark", {
				background: "#1a1216",
				panel: "#241a1e",
				panelAlt: "#2e2026",
				accent: "#e08aa0",
				accentAlt: "#f0b3c4",
				secondary: "#a86a7a",
				highlight: "#d4728a",
				text: "#f7eef0",
				muted: "#c3aab0",
				line: "rgba(224, 138, 160, .28)"
			}),
			preset("morning-mist", "晨雾山水", "light", {
				background: "#f2eee5",
				panel: "#fbf9f3",
				panelAlt: "#e8e2d6",
				accent: "#66776f",
				accentAlt: "#87968e",
				secondary: "#a88f5b",
				highlight: "#4f6259",
				text: "#272b28",
				muted: "#747971",
				line: "rgba(102, 119, 111, 0.28)"
			}),
			preset("cecilylove002", "休闲室内居家", "dark", {
				background: "#131313",
				panel: "#1e1e1e55",
				panelAlt: "#2a2a2a",
				accent: "#4b75a6",
				accentAlt: "#6488b2",
				secondary: "#b9a788",
				highlight: "#7898bc",
				text: "#f0f0f0",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("lucy-moon", "露西", "dark", {
				background: "#131214",
				panel: "#1d1d1e",
				panelAlt: "#29292b",
				accent: "#23eaee",
				accentAlt: "#42edf0",
				secondary: "#dacf3b",
				highlight: "#5aeff2",
				text: "#efeff0",
				muted: "#939294",
				line: "#3f3e40"
			}),
			preset("moonlit-pine", "月下松岚", "dark", {
				background: "#0c1118",
				panel: "#151c25",
				panelAlt: "#202a35",
				accent: "#8095a5",
				accentAlt: "#a4b4c0",
				secondary: "#687f73",
				highlight: "#a4afb5",
				text: "#edf1f3",
				muted: "#9aa5ad",
				line: "rgba(128, 149, 165, 0.30)"
			}),
			preset("wukong", "悟空（WUKONG）", "dark", {
				background: "#131313",
				panel: "#1d1e1d",
				panelAlt: "#2a2a2a",
				accent: "#f6c696",
				accentAlt: "#f7cea5",
				secondary: "#2c7c95",
				highlight: "#f8d4b0",
				text: "#f0f0f0",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("dreamskin-2560x1440", "保险柜 办公室 卡通", "dark", {
				background: "#131313",
				panel: "#1e1e1d",
				panelAlt: "#2b2b2a",
				accent: "#d04f37",
				accentAlt: "#d76853",
				secondary: "#bcd08d",
				highlight: "#dc7b69",
				text: "#f0f0ef",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("deepseek", "DeepSeek-鲸鱼娘", "light", {
				background: "#bd9999",
				panel: "#abb4cf",
				panelAlt: "#c3cee4",
				accent: "#7a4e29",
				accentAlt: "#ceb683",
				secondary: "#85c1cc",
				highlight: "#455b78",
				text: "#352970",
				muted: "#030303",
				line: "#d3d3d4"
			}),
			preset("mikuu-full-background", "mikuu full background", "light", {
				background: "#f5f6f7",
				panel: "#ffffff",
				panelAlt: "#e7e9eb",
				accent: "#0e8fbf",
				accentAlt: "#0c7ba4",
				secondary: "#5575d1",
				highlight: "#0b6b8f",
				text: "#191b1f",
				muted: "#68696c",
				line: "#d2d3d4"
			}),
			preset("poster", "Poster 粉彩", "light", {
				background: "#f2e5d4",
				panel: "#eed8e3",
				panelAlt: "#eae9e8",
				accent: "#b471c6",
				accentAlt: "#ceb4a1",
				secondary: "#704e35",
				highlight: "#462f3a",
				text: "#43382d",
				muted: "#e8bfd1",
				line: "#d4d3d3"
			}),
			preset("reze", "蕾塞", "dark", {
				background: "#541d28",
				panel: "#18292a",
				panelAlt: "#2b2a29",
				accent: "#d8d0ca",
				accentAlt: "#7e553a",
				secondary: "#4a7c6f",
				highlight: "#b48d74",
				text: "#f0f0ef",
				muted: "#949392",
				line: "#403f3e"
			}),
			preset("firefly", "firefly", "light", {
				background: "rgba(230, 239, 240, 0.04)",
				panel: "rgba(189, 204, 209, 0.26)",
				panelAlt: "rgba(224, 237, 240, 0.68)",
				accent: "#f59e0b",
				accentAlt: "#e63983",
				secondary: "#08a9b9",
				highlight: "#fff0c7",
				text: "#263b42",
				muted: "#4f6971",
				line: "rgba(78, 121, 131, 0.38)"
			}),
			preset("juzizhoutou", "橘子洲头-毛主席", "dark", {
				background: "#131313",
				panel: "#1d1d1d",
				panelAlt: "#2a2a2a",
				accent: "#ebb273",
				accentAlt: "#eebd87",
				secondary: "#2a7aa4",
				highlight: "#f0c596",
				text: "#f0f0f0",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("republic", "人民的AI", "light", {
				background: "#f7f5f5",
				panel: "#fefefe",
				panelAlt: "#ece8e7",
				accent: "#f04a3b",
				accentAlt: "#ce4033",
				secondary: "#dd5c50",
				highlight: "#b4382c",
				text: "#201918",
				muted: "#6d6868",
				line: "#d5d2d2"
			}),
			preset("111", "大肥鱼（8.1）", "light", {
				background: "#ffffff",
				panel: "#84b4e1",
				panelAlt: "#7da2d9",
				accent: "#405377",
				accentAlt: "#2e74ff",
				secondary: "#35589c",
				highlight: "#2a4d92",
				text: "#000000",
				muted: "#65676c",
				line: "#d2d3d5"
			}),
			preset("quiet-orbit", "寂静星轨", "dark", {
				background: "#070d20",
				panel: "#0d1630",
				panelAlt: "#151f3c",
				accent: "#758df5",
				accentAlt: "#9b83e9",
				secondary: "#55b6e8",
				highlight: "#a7b8ff",
				text: "#f0f3ff",
				muted: "#98a5c6",
				line: "rgba(117, 141, 245, 0.28)"
			}),
			preset("123456", "芙宁娜 小白袜", "light", {
				background: "#f6f6f6",
				panel: "#fefefe",
				panelAlt: "#e9e9e9",
				accent: "#308cca",
				accentAlt: "#2978ae",
				secondary: "#a67d66",
				highlight: "#0099ff",
				text: "#000000",
				muted: "#696969",
				line: "#80c8ff"
			}),
			preset("idea-engine", "灵感小宇宙", "light", {
				background: "#f1faf8",
				panel: "#ffffff",
				panelAlt: "#e2f3f0",
				accent: "#2dbdb7",
				accentAlt: "#f0c928",
				secondary: "#53a9df",
				highlight: "#ef7064",
				text: "#173033",
				muted: "#567a77",
				line: "#2dbdb7"
			}),
			preset("forest", "安静氛围 森林", "dark", {
				background: "#131412",
				panel: "#1d1e1c",
				panelAlt: "#292c29",
				accent: "#ca9055",
				accentAlt: "#d1a06d",
				secondary: "#308351",
				highlight: "#d7ac80",
				text: "#eff0ef",
				muted: "#939492",
				line: "#3f403e"
			}),
			preset("violet-evergarden", "Cyber · 紫罗兰永恒花园", "dark", {
				background: "#34323e",
				panel: "#625F73",
				panelAlt: "#5D5F70",
				accent: "#FBEDF1",
				accentAlt: "#5D676F",
				secondary: "#88E0A1",
				highlight: "#7BAFDD",
				text: "#FFFFFF",
				muted: "#A6A6A6",
				line: "#B5B2D7"
			}),
			preset("claude-eva-warm", "Claude EVA 暖奶油", "light", {
				background: "#F4F1EA",
				panel: "#FAF7F0",
				panelAlt: "#EFEAE0",
				accent: "#D97757",
				accentAlt: "#E28C6E",
				secondary: "#8B95A1",
				highlight: "#F5E7DC",
				text: "#3D3A33",
				muted: "#8A8477",
				line: "#E3DCD0"
			}),
			preset("46-morning-4k", "46 morning 4k", "dark", {
				background: "#131313",
				panel: "#1d1d1d",
				panelAlt: "#2a2a2a",
				accent: "#a46151",
				accentAlt: "#b17769",
				secondary: "#52788b",
				highlight: "#bb897d",
				text: "#f0f0f0",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("cloud-ascent", "云上仙途", "light", {
				background: "#f1f7f3",
				panel: "#e2eee7",
				panelAlt: "#e2eee7",
				accent: "#69b99a",
				accentAlt: "#9bd8ba",
				secondary: "#73b8c2",
				highlight: "#d9b86c",
				text: "#24332e",
				muted: "#657b73",
				line: "#69b99a"
			}),
			preset("quiet-paper", "清透定制", "light", {
				background: "#f5f6ee",
				panel: "#e9ede1",
				panelAlt: "#e9ede1",
				accent: "#91a176",
				accentAlt: "#b1bd91",
				secondary: "#c7ceb0",
				highlight: "#6f8057",
				text: "#252a20",
				muted: "#68705d",
				line: "#91a176"
			}),
			preset("miku", "miku-猛男版", "light", {
				background: "#a0b9cd",
				panel: "#f8f8f8",
				panelAlt: "#e4e4e4",
				accent: "#9c8c55",
				accentAlt: "#887946",
				secondary: "#b88381",
				highlight: "#7a6c3e",
				text: "#181818",
				muted: "#646464",
				line: "#cbcbcb"
			}),
			preset("jimeng-2026-08-04-5645", "栗棕卷发", "dark", {
				background: "#131313",
				panel: "#1d1d1d",
				panelAlt: "#2a2a2a",
				accent: "#996c4b",
				accentAlt: "#a78164",
				secondary: "#6c97a9",
				highlight: "#b39178",
				text: "#f0f0f0",
				muted: "#939393",
				line: "#3f3f3f"
			}),
			preset("rainwashed-celadon", "雨过青瓷", "light", {
				background: "#edf2ee",
				panel: "#f8faf7",
				panelAlt: "#dde8e2",
				accent: "#63877e",
				accentAlt: "#85a39b",
				secondary: "#93a9a1",
				highlight: "#496d65",
				text: "#24312d",
				muted: "#6e7f78",
				line: "rgba(99, 135, 126, 0.28)"
			}),
			preset("cecilylove003", "好看户外治愈", "light", {
				background: "rgba(205, 231, 242, 0)",
				panel: "rgba(245, 250, 252, 0.25)",
				panelAlt: "rgba(248, 252, 253, 0.72)",
				accent: "#176b99",
				accentAlt: "#2f83ae",
				secondary: "#55733b",
				highlight: "#0f587d",
				text: "#17323f",
				muted: "rgba(36, 69, 84, 0.74)",
				line: "rgba(31, 82, 107, 0.22)"
			}),
			preset("20250906191759-6023-71", "202509061917596371", "dark", {
				background: "#141213",
				panel: "#1f1c1d",
				panelAlt: "#2d2729",
				accent: "#eb1241",
				accentAlt: "#ee335c",
				secondary: "#9c5c8b",
				highlight: "#f1597b",
				text: "#f1efef",
				muted: "#949293",
				line: "#403e3f"
			}),
			preset("art", "art", "dark", {
				background: "#121314",
				panel: "#1c1d1f",
				panelAlt: "#282a2d",
				accent: "#1c75c3",
				accentAlt: "#3c88cb",
				secondary: "#ccb7a5",
				highlight: "#5598d2",
				text: "#eff0f1",
				muted: "#929394",
				line: "#3e3f40"
			}),
			preset("redline-breakout", "SPIDER-MAN", "dark", {
				background: "#090808",
				panel: "#151112",
				panelAlt: "#241a1b",
				accent: "#e64835",
				accentAlt: "#ff7566",
				secondary: "#d6cbbd",
				highlight: "#921f24",
				text: "#f5efe5",
				muted: "#b9aea1",
				line: "rgba(227, 63, 54, 0.30)"
			})
		]);
		//#endregion
		//#region src/client/settings-store.ts
		/**
		* Dream Skin settings store: a mirror of the theme service preference. The
		* plugin's apply-world theme/change listener is the only writer; the settings
		* component reads via props.useStore.
		*/
		/**
		* Declares the Dream Skin settings state and write surface.
		* @returns the store handle.
		*/
		function createDreamSkinStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					preference: "system",
					revision: -1
				}),
				actions: { sync: (d, preference, revision) => {
					if (revision <= d.revision) return;
					d.preference = preference;
					d.revision = revision;
				} }
			});
		}
		//#endregion
		//#region \0dsh-css:D:\AI应用\deepseek-harness\packages\client\dsh-dream-skin\src\client\DreamSkinSettings.module.css.mjs
		const css = ".zGpYfG_root{flex-direction:column;gap:8px;padding:16px;display:flex}.zGpYfG_hint{color:var(--dsw-alias-label-secondary);margin-bottom:4px;font-size:12px;line-height:1.5}.zGpYfG_card{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;border-radius:8px;align-items:center;gap:10px;padding:10px 12px;font-size:13px;display:flex}.zGpYfG_card:hover{border-color:var(--dsw-alias-border-l2)}.zGpYfG_selected{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}.zGpYfG_swatchRow{flex-shrink:0;gap:4px;display:inline-flex}.zGpYfG_swatch{border:1px solid var(--dsw-alias-border-l1);border-radius:4px;width:14px;height:14px}.zGpYfG_preview{aspect-ratio:16/10;border:1px solid var(--dsw-alias-border-l1);pointer-events:none;z-index:10;border-radius:10px;width:320px;position:fixed;top:50%;right:24px;overflow:hidden;transform:translateY(-50%);box-shadow:0 8px 24px #00000059}.zGpYfG_preview img{object-fit:cover;width:100%;height:100%;display:block}";
		const tagId = "@deepseek-ai/dsh-dream-skin/DreamSkinSettings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-dream-skin";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DreamSkinSettings_module_css_default = {
			"swatchRow": "zGpYfG_swatchRow",
			"swatch": "zGpYfG_swatch",
			"preview": "zGpYfG_preview",
			"hint": "zGpYfG_hint",
			"root": "zGpYfG_root",
			"card": "zGpYfG_card",
			"selected": "zGpYfG_selected"
		};
		//#endregion
		//#region src/client/DreamSkinSettings.tsx
		/**
		* Dream Skin settings section: the shipped presets as cards with preview
		* swatches, a "follow system" reset, and a hover wallpaper preview. Selection
		* reads the persisted preference (never the resolved active theme) and writes
		* through the injected select callback.
		*/
		/** Preference ids that mean "not a Dream Skin preset". */
		const DEFAULT_IDS = new Set([
			"system",
			"light",
			"dark"
		]);
		/**
		* Render the Dream Skin settings section.
		* @param props - composed slot props.
		* @returns the section element tree.
		*/
		function DreamSkinSettings({ useStore, presets, select }) {
			const preference = useStore((s) => s.preference);
			const [hovered, setHovered] = (0, react.useState)(null);
			const isDefault = DEFAULT_IDS.has(preference);
			const hoveredPreset = hovered === null ? void 0 : presets.find((p) => p.id === hovered && p.wallpaper !== void 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DreamSkinSettings_module_css_default.root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DreamSkinSettings_module_css_default.hint,
						children: "选择一套 Dream Skin 主题，悬停预览壁纸，点击即应用。"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: isDefault ? `${DreamSkinSettings_module_css_default.card} ${DreamSkinSettings_module_css_default.selected}` : DreamSkinSettings_module_css_default.card,
						"aria-pressed": isDefault,
						onClick: () => {
							select("system");
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: DreamSkinSettings_module_css_default.swatchRow,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DreamSkinSettings_module_css_default.swatch,
								style: {
									background: "transparent",
									border: "1px dashed var(--dsw-alias-label-secondary)"
								}
							})
						}), "跟随系统"]
					}),
					presets.map((p) => {
						const selected = preference === p.id;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: selected ? `${DreamSkinSettings_module_css_default.card} ${DreamSkinSettings_module_css_default.selected}` : DreamSkinSettings_module_css_default.card,
							"aria-pressed": selected,
							onClick: () => {
								select(p.id);
							},
							onMouseEnter: () => {
								setHovered(p.id);
							},
							onMouseLeave: () => {
								setHovered(null);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DreamSkinSettings_module_css_default.swatchRow,
								children: p.swatches.map((color) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: DreamSkinSettings_module_css_default.swatch,
									style: { background: color }
								}, color))
							}), p.label]
						}, p.id);
					}),
					hoveredPreset?.wallpaper !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DreamSkinSettings_module_css_default.preview,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: hoveredPreset.wallpaper.url,
							alt: "",
							draggable: false
						})
					})
				]
			});
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/misc.ts
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/types.ts
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		let Binary;
		(function(_Binary) {
			_Binary.is = isArrayBufferLike;
			_Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			_Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			_Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			_Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			_Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			_Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/time.ts
		let Time;
		(function(_Time) {
			_Time.millisecond = 1;
			const second = _Time.second = 1e3;
			const minute = _Time.minute = second * 60;
			const hour = _Time.hour = minute * 60;
			const day = _Time.day = hour * 24;
			const week = _Time.week = day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			_Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			_Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / minute - offset) / 1440);
			}
			_Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * minute);
			}
			_Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
			}
			_Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			_Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
				else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
				else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
				else if (abs >= second) return Math.round(ms / second) + "s";
				return ms + "ms";
			}
			_Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			_Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			_Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region src/dream-settings.ts
		/** Dream Skin theme preference stored in the Host user-settings document. */
		/** Settings namespace owned by the dream-skin plugin. */
		const DREAM_SKIN_NAMESPACE = "dream-skin";
		/** Field carrying the selected theme id. */
		const DREAM_SKIN_THEME_FIELD = "themeId";
		Schema.object({ [DREAM_SKIN_THEME_FIELD]: Schema.string().default("system") });
		//#endregion
		//#region src/client/index.ts
		/** Required services: theme registry, slot system, and the durable settings scope. */
		const inject = [
			"theme",
			"slots",
			"settingsScope"
		];
		/**
		* Register every Dream Skin preset, restore the persisted selection, and
		* mount the switching section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			ctx.effect(() => {
				const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition));
				return () => {
					for (const dispose of disposers) dispose();
				};
			});
			const host = ctx.settingsScope.bind({ namespace: DREAM_SKIN_NAMESPACE });
			const saved = host.getSnapshot().value?.themeId;
			if (saved !== void 0 && saved !== "system" && DREAM_SKIN_PRESETS.some((preset) => preset.id === saved)) ctx.theme.setTheme(saved);
			const store = createDreamSkinStore();
			let bound;
			const sync = (snapshot) => {
				bound?.sync(snapshot.preference, snapshot.revision);
			};
			ctx.on("theme/change", sync);
			const injected = (actions) => {
				bound = actions;
				sync(ctx.theme.getTheme());
				return {
					presets: DREAM_SKIN_PRESETS,
					select: (id) => {
						ctx.theme.setTheme(id);
						host.set(DREAM_SKIN_THEME_FIELD, id);
					}
				};
			};
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "dream-skin",
				order: 25,
				label: "Dream Skin",
				store,
				inject: injected
			}, DreamSkinSettings));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map