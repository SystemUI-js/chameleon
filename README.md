Chameleon

一个使用 TypeScript + Vite + React 构建的 React 组件库脚手架，集成了 ESLint、Prettier 与 Jest。

快速开始

- 安装依赖：yarn
- 本地开发：yarn dev（打开浏览器访问提示地址）
- 代码检查与格式化：yarn lint / yarn lint:fix / yarn format
- 运行测试：yarn test
- 构建组件库：yarn build（产物输出到 dist/）

目录结构（部分）

- src/components/Button.tsx：示例组件
- src/index.ts：库入口导出
- tests/Button.test.tsx：示例单测
- index.html + src/dev/main.tsx：Vite 预览入口
- vite.config.ts / tsconfig.json / jest.config.ts / jest.setup.ts：相关配置
- .eslintrc.cjs / .prettierrc.json：代码规范
- CHANGELOG.md：版本记录

发布与使用

- 作为库发布后，以 @sysui/chameleon 安装并在代码中导入组件使用。
