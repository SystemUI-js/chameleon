# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-17T07:50:00Z
**Project:** @sysui/chameleon
**Type:** React Component Library

## OVERVIEW

React 18 + TypeScript 组件库，使用 Vite 构建为 UMD/ES 模块，集成 Jest + React Testing Library 测试。

## STRUCTURE

```
./
├── src/
│   ├── components/    # 组件源码 (Button.tsx)
│   ├── types/         # 类型声明 (SCSS modules)
│   ├── dev/           # Vite 开发预览入口
│   └── index.ts       # 库导出入口
├── tests/             # 测试文件
├── dist/              # 构建产物 (自动生成)
├── docs/              # 文档
└── .github/workflows/ # CI/CD
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add component | `src/components/` | 遵循 Button.tsx 模式 |
| Add types | `src/types/` | SCSS module declarations |
| Write tests | `tests/` | Button.test.tsx 参考 |
| CI config | `.github/workflows/` | PR checks, publish |
| Library entry | `src/index.ts` | 组件导出 |

## CONVENTIONS

**TypeScript:**
- `strict: true` - 严格模式启用
- `noUnusedLocals: true` - 未使用局部变量报错
- `noUnusedParameters: true` - 未使用参数报错
- 例外: `_` 前缀变量允许 (`argsIgnorePattern: '^_'`)

**ESLint Flat Config:**
- 禁用 `no-unused-vars`，使用 `@typescript-eslint/no-unused-vars`
- 必须忽略 `_` 开头的参数
- Prettier 规则作为 `error` 强制执行
- sonarjs: `constructor-for-side-effects` 已禁用

**Prettier:**
- 继承 `prettier-config-standard`
- 无额外配置

**Styling:**
- 使用 CSS className 字符串拼接 (非 CSS-in-JS)
- 类名前缀: `cm-btn`, `cm-btn--{variant}`
- SCSS modules 类型声明在 `src/types/styles.d.ts`

## ANTI-PATTERNS (THIS PROJECT)

- **NO** `any` 类型 - 严格类型检查
- **NO** CSS-in-JS - 使用 plain CSS className
- **NO** 组件内样式 - 样式与组件分离
- **NO** 默认导出组件外的内容

## COMMANDS

```bash
# 开发
yarn dev              # Vite dev server (port 5673)

# 代码质量
yarn lint             # ESLint 检查
yarn lint:fix         # ESLint 自动修复
yarn format           # Prettier 格式化

# 测试
yarn test             # Jest (jsdom)
yarn test:watch       # Jest watch 模式

# 构建
yarn build            # Vite lib build → dist/
yarn preview          # 预览构建产物
```

## NOTES

- 路径别名: `@/` → `src/`
- React 版本: 18.2.0 || 19.0.0
- 构建产物: `dist/chameleon.es.js` (ESM), `dist/chameleon.umd.cjs` (UMD)
- CI: PR 必须通过 lint → test → build → npm pack dry-run

## Recent Changes
- 001-menu-dropdown: 新增多级子菜单功能，支持键盘导航与焦点管理

## Active Technologies
- TypeScript 5.6, React 18.2, Vite 5, Sass, Jest + React Testing Library
