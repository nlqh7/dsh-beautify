window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-dream-skin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
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
				"--dsw-alias-bg-base": wallpaper !== void 0 ? `linear-gradient(90deg, ${hexToRgba(p.background, .88)} 0%, ${hexToRgba(p.background, .62)} 45%, ${hexToRgba(p.background, .12)} 72%, transparent 90%), url("${wallpaper.url}") ${Math.round(wallpaper.focusX * 100)}% ${Math.round(wallpaper.focusY * 100)}% / cover no-repeat` : p.background,
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
				])
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
		const css = ".zGpYfG_root{flex-direction:column;gap:8px;padding:16px;display:flex}.zGpYfG_hint{color:var(--dsw-alias-label-secondary);margin-bottom:4px;font-size:12px;line-height:1.5}.zGpYfG_card{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;border-radius:8px;align-items:center;gap:10px;padding:10px 12px;font-size:13px;display:flex}.zGpYfG_card:hover{border-color:var(--dsw-alias-border-l2)}.zGpYfG_selected{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}.zGpYfG_swatchRow{flex-shrink:0;gap:4px;display:inline-flex}.zGpYfG_swatch{border:1px solid var(--dsw-alias-border-l1);border-radius:4px;width:14px;height:14px}";
		const tagId = "@deepseek-ai/dsh-dream-skin/DreamSkinSettings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-dream-skin";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DreamSkinSettings_module_css_default = {
			"hint": "zGpYfG_hint",
			"selected": "zGpYfG_selected",
			"card": "zGpYfG_card",
			"swatchRow": "zGpYfG_swatchRow",
			"swatch": "zGpYfG_swatch",
			"root": "zGpYfG_root"
		};
		//#endregion
		//#region src/client/DreamSkinSettings.tsx
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
			const isDefault = DEFAULT_IDS.has(preference);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DreamSkinSettings_module_css_default.root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: DreamSkinSettings_module_css_default.hint,
						children: "选择一套 Dream Skin 主题，点击即应用。"
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
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: DreamSkinSettings_module_css_default.swatchRow,
								children: p.swatches.map((color) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: DreamSkinSettings_module_css_default.swatch,
									style: { background: color }
								}, color))
							}), p.label]
						}, p.id);
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: the theme registry this package skins and the slot system. */
		const inject = ["theme", "slots"];
		/**
		* Register every Dream Skin preset and mount the switching section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			ctx.effect(() => {
				const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition));
				return () => {
					for (const dispose of disposers) dispose();
				};
			});
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