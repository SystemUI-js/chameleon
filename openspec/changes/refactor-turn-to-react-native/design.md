## Context

当前仓库仍是以 React Web/DOM 为中心的组件库：`src/index.ts` 通过单一根入口导出组件与主题定义，`package.json` 也只声明了 `"."` 这一组 `import/require/types` 导出。拖拽相关能力分散在 `WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider` 等组件中，并统一依赖 `@system-ui-js/multi-drag`；这些实现广泛使用 `HTMLElement`、`HTMLDivElement`、`PointerEvent`、`MouseEvent`、`DOMRect`、`document.addEventListener`、`window.clearTimeout` 与 `getBoundingClientRect()` 等浏览器/DOM API。

本次变更不是简单替换一个拖拽依赖，而是要先为仓库建立“React Native 优先”的平台边界：

- 拖拽底层从 `@system-ui-js/multi-drag` 转向 `@system-ui-js/multi-drag-core`，复用核心状态与算法，而不是继续绑定 web 包装层。
- 在仓库内新增 `src/react-native-multi-drag/`，先落地可迁移、可独立发包的 React Native 拖拽能力。
- 调整公开契约，使后续对外能力不再默认以 web/DOM 为前提。

这意味着设计重点不是“如何让现有 DOM 组件继续工作”，而是“如何在不一次性重写全仓库的前提下，先抽出一个不依赖 DOM 的 React Native 能力边界，并为未来独立拆包与消费者迁移提供清晰路径”。

## Goals / Non-Goals

**Goals:**

- 建立一个基于 `@system-ui-js/multi-drag-core` 的 React Native 拖拽封装层，明确输入适配、状态同步与公开 API 的责任边界。
- 将平台相关逻辑收敛到 `src/react-native-multi-drag/` 内部，避免新能力继续扩散 DOM 假设。
- 为未来独立发包预留清晰的源码边界、类型边界与导出边界。
- 调整包入口/公开面，使 React Native 能力可以被显式消费，同时避免“根入口默认就是 web 组件库”的隐含前提。
- 为现有 web 代码保留受控的过渡空间，降低一次性全量迁移风险。

**Non-Goals:**

- 不在本次变更中把现有全部组件（如 `Window`、`Menu`、`CSplitArea`）重写为 React Native 版本。
- 不尝试让现有所有 DOM 实现自动跨平台复用；已有 web 组件先视为遗留实现。
- 不在本次变更中处理浏览器预览链路（`src/dev`、Playwright demo）到 React Native 的完整替代方案。
- 不修改 `@system-ui-js/multi-drag-core` 自身算法实现；本次仅定义仓库内的集成与适配方式。

## Decisions

### 1. 采用“core + native adapter + public facade”三层结构

`src/react-native-multi-drag/` 将按三层职责组织：

1. **core binding 层**：负责与 `@system-ui-js/multi-drag-core` 对接，只处理 pose、状态机、拖拽生命周期等平台无关能力。
2. **native adapter 层**：负责把 React Native 的手势/布局信息转换为 core 可消费的数据结构，不暴露 DOM 元素、浏览器事件或 `getBoundingClientRect()` 之类前提。
3. **public facade 层**：对外暴露稳定的 React Native API（如 hook、controller、组件包装器或类型），并把内部适配细节收敛在模块内。

- 选择该方案的原因：可以把“核心算法复用”和“平台输入差异”彻底分离，后续独立拆包时也只需迁移这一目录，而不必继续从现有 web 组件中剥离逻辑。
- 备选方案：直接在现有组件内把 `@system-ui-js/multi-drag` 替换为 `@system-ui-js/multi-drag-core`。
- 不采用备选方案的原因：现有组件实现深度耦合 DOM、样式类名和浏览器事件，即使换成 core 也仍然不是 React Native 优先设计，无法形成清晰的可迁移边界。

### 2. 平台输入统一收敛为抽象拖拽会话，而不是暴露原生事件对象

React Native 版本对外不直接透传浏览器式 `PointerEvent`/`MouseEvent`，而是围绕“拖拽会话”提供抽象输入：开始位置、当前位移、结束状态、可选的布局测量结果，以及与业务相关的拖拽元数据。native adapter 负责把具体手势系统（例如 responder 或后续替换的手势实现）转换为统一输入，再交由 core 计算。

- 选择该方案的原因：React Native 不存在 DOM 事件模型，若公开 API 继续围绕浏览器事件设计，消费者将被迫依赖兼容层或自行做二次转换，违背平台契约目标。
- 备选方案：直接把具体手势库对象暴露给消费者或内部各处自行处理。
- 不采用备选方案的原因：会把平台或库级依赖泄漏到公共契约中，未来更换手势实现或独立拆包都会引入破坏性变更。

### 3. 现有 web 拖拽组件保持遗留状态，不作为新能力的复用宿主

`WindowTitle`、`Widget`、`IconContainer`、`CSplitArea`、`CSlider` 等现有组件短期内继续保留其 web/DOM 实现，但不再作为 React Native 能力的直接宿主；新能力只在 `src/react-native-multi-drag/` 建立独立实现与契约。需要复用的仅限与业务无关的数学/状态规则，且这类复用必须通过纯函数或 core 层完成，而不是共享 DOM 组件代码。

- 选择该方案的原因：当前仓库中的拖拽组件不仅依赖 DOM，还耦合 className、布局节点和浏览器级事件监听；强行做“通用组件”会把本次变更扩大为高风险的全库重构。
- 备选方案：把 `Widget` 或 `WindowTitle` 抽象成跨平台基础组件，再由 web 与 native 共用一套 UI 层。
- 不采用备选方案的原因：需要同时解决样式系统、布局系统、事件模型与测试基建差异，成本过高且会阻塞 React Native 能力先落地。

### 4. 包公开面改为“显式平台入口 + 平台无关根契约”

包入口调整遵循两个原则：

- **React Native 能力通过显式入口暴露**，例如独立子路径或等价的稳定导出边界，使消费者能够明确依赖 `react-native-multi-drag` 能力，而不是从当前 web 组件集合中“顺带”获得。
- **根入口仅承载平台无关或仍被支持的公共契约**，不得把 DOM 前提包装成默认公共能力；若某些既有 web-only 导出暂时保留，也需要被标识为过渡能力，而不是新的推荐消费路径。

- 选择该方案的原因：可以同时满足“React Native 优先”和“渐进迁移”两个目标，并为未来把 `src/react-native-multi-drag/` 提取成独立包保留稳定路径。
- 备选方案：继续只保留单一根入口，把 React Native 能力也直接塞进现有 `src/index.ts`。
- 不采用备选方案的原因：会延续当前入口的语义混乱，消费者无法区分哪些能力是平台无关、哪些能力依赖 web，后续拆包也更难做兼容映射。

### 5. 目录边界优先于代码复用，先保证可迁移性

`src/react-native-multi-drag/` 将作为完整边界存在，内部自带自己的类型、入口、适配器和辅助实现；只有当某段逻辑可以证明与平台无关时，才允许被提取到共享层。换言之，本次设计优先保证“未来可单独搬走”，而不是追求当前仓库内最大化复用。

- 选择该方案的原因：提案已经明确该能力未来可能独立发包，因此目录自治比短期少写几段代码更重要。
- 备选方案：把大部分实现散落在 `src/components/`、`src/utils/`、`src/theme/` 等现有目录，再在新目录里做薄封装。
- 不采用备选方案的原因：会让后续拆包需要横向抽取多个目录，增加依赖污染、构建耦合和迁移成本。

### 6. 迁移以“并行引入新能力 + 明确 breaking 契约”推进

本次变更的迁移策略不是无感替换，而是显式引入新平台能力并同步声明 breaking contract：现有依赖 DOM 假设的使用方式不再是默认路径；新的文档、导出和实现都以 React Native 能力为中心。对于仓库内部尚未迁移的 web 组件，将通过过渡期标注、受限导出或后续拆分计划进行管理，而不是继续扩大其公共承诺范围。

- 选择该方案的原因：提案已明确这是 breaking change；与其制造“表面兼容、实则语义冲突”的状态，不如在文档与导出上给出清晰迁移边界。
- 备选方案：保持现有 web 契约不变，仅增加一个实验性的 native 目录。
- 不采用备选方案的原因：无法体现仓库方向已转为 React Native 优先，也会让消费者继续把 web 实现当作长期默认能力，延后真正迁移成本。

## Risks / Trade-offs

- [根入口如何收缩会影响现有消费者升级成本] → 在 tasks 阶段明确导出级别的 breaking 变更清单，并为仍需保留的过渡导出设定范围与退出计划。
- [React Native 手势桥接方案若过早绑定具体库，后续替换成本高] → 公共契约只暴露抽象拖拽会话与类型，具体手势实现限制在 adapter 内部。
- [现有 web 组件与新 native 能力并存，容易造成仓库语义混乱] → 通过目录边界、入口边界和文档边界明确“legacy web”与“native-first”职责，不再新增建立在 DOM 前提上的公共能力。
- [为独立拆包预留边界可能带来短期重复实现] → 接受有限重复，以换取更低的长期迁移成本；仅在纯算法或纯类型层复用。
- [测试与开发链路仍以 web 为主，native 能力验证基础设施不完整] → 在实施阶段优先补齐模块级测试与契约测试，避免依赖现有浏览器 demo 作为唯一验证方式。

## Migration Plan

1. 在 `src/react-native-multi-drag/` 建立独立目录与入口，完成对 `@system-ui-js/multi-drag-core` 的封装边界设计。
2. 定义 React Native 公开 API、类型契约与内部 adapter 结构，确保新模块不引入 DOM 依赖。
3. 调整包导出策略：新增显式的 React Native 能力入口，并重新审视根入口仅保留的平台无关/受支持契约。
4. 梳理现有 `@system-ui-js/multi-drag` 使用点，识别哪些仍属于遗留 web 能力、哪些可在后续阶段迁移到 core 驱动模型。
5. 通过文档、变更说明与后续 specs/tasks 明确 breaking 影响和消费者迁移路径。
6. 若发布后需要回滚，可先回退新增入口与新目录实现，保留现有 web 导出；该回滚不涉及数据迁移，但会撤销 React Native 优先契约。

## Open Questions

- React Native 手势桥接首版是基于原生 responder 能力，还是允许引入额外手势库作为内部实现细节？
- 根入口中哪些现有 web-only 导出需要在过渡期继续保留，哪些应直接移出默认公共契约？
- `react-native-multi-drag` 首版对外最佳形态是什么：hook、控制器对象、还是组件包装器组合？
- 是否需要在本次变更中同步定义与未来独立包一致的子路径/命名，以减少后续重命名成本？
