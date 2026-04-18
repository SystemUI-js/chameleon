## 1. 依赖与目录边界调整

- [x] 1.1 将拖拽底层依赖从 `@system-ui-js/multi-drag` 切换为 `@system-ui-js/multi-drag-core`，并清理新能力对 web 包装层的直接依赖
- [x] 1.2 在 `src/react-native-multi-drag/` 下建立独立的目录、内部入口与文件分层，明确 core binding、native adapter 与 public facade 的职责边界
- [x] 1.3 定义 React Native 多拖拽所需的抽象类型契约（会话、位移、布局测量、元数据、结束结果），确保公开面不暴露 DOM 或浏览器事件类型

## 2. React Native 多拖拽核心能力实现

- [x] 2.1 基于 `@system-ui-js/multi-drag-core` 实现可启动、更新与结束拖拽会话的核心封装，统一输出会话状态与结束原因
- [x] 2.2 实现受控的 native adapter，将 React Native 手势输入与布局测量结果转换为内部统一拖拽输入，而不是直接向公开 API 透传平台事件对象
- [x] 2.3 实现可支撑多目标/多句柄场景的统一状态模型，持续同步当前激活目标、拖拽位移、会话标识与业务元数据

## 3. 包入口与平台契约收敛

- [x] 3.1 为 `react-native-multi-drag` 新增稳定且显式的平台入口与类型导出，使消费者无需经过根入口即可导入 React Native 优先能力
- [x] 3.2 调整 `package.json` 与相关入口文件的导出配置，区分 React Native 平台入口与根入口的职责边界
- [x] 3.3 收敛根入口的公共导出语义，仅保留平台无关或受控过渡能力，并明确既有 web-only 导出属于 legacy/过渡范围

## 4. 验证与迁移说明

- [x] 4.1 补充模块级测试，覆盖拖拽会话生命周期、多目标状态同步以及公开契约不依赖 DOM 前提的关键行为
- [x] 4.2 补充面向消费者的 breaking change 与迁移说明，明确 React Native 显式入口、根入口语义变化与 legacy web 能力边界
- [x] 4.3 运行 `yarn lint`、`yarn test` 与 `yarn build`，验证新目录、导出结构与 React Native 优先契约可正常集成
