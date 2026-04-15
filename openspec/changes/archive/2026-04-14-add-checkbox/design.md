## Context

组件库当前已提供 `CRadio`、`CSelect`、`CButton` 等基础交互组件，并且在组件层已经形成了较稳定的实现约束：

- 组件源码位于 `src/components/<Name>/`
- 样式使用独立 `index.scss`
- 主题通过 `useTheme`、`normalizeThemeClassName` 与 `mergeClasses` 注入稳定主题类名
- 公共能力需要同时接入 `src/components/index.ts` 与 `src/index.ts`
- Jest + React Testing Library 用于验证组件渲染、交互和公共导出

`CCheckbox` 与现有 `CRadio` 在视觉结构上接近，但交互模型不同：单个复选框不依赖组上下文，既要支持原生布尔切换，也要支持 React 常见的受控/非受控模式。因此本次设计重点在于复用现有组件约定，同时避免把单选框的 group 结构硬套到复选框上。

## Goals / Non-Goals

**Goals:**

- 提供单个 `CCheckbox` 组件，满足布尔选择和多选列表中的基础使用场景
- 支持 `checked`、`defaultChecked`、`onChange` 的受控/非受控用法
- 提供稳定的 `cm-checkbox`、`cm-checkbox__input`、`cm-checkbox__label` 等类名，并兼容禁用态样式扩展
- 保持与现有主题系统、组件导出结构和测试风格一致
- 通过原生 `<input type="checkbox">` 保留基础可访问性和浏览器交互语义

**Non-Goals:**

- 不引入 `CheckboxGroup` 之类的分组抽象
- 不在本次变更中增加三态（indeterminate）或树形勾选联动能力
- 不新增自定义图标系统、动画系统或主题变量体系重构
- 不修改已有 `CRadio`、`CSelect` 等组件的行为约束

## Decisions

### 1. 采用独立单组件实现，而不是复用 `CRadioGroup` 模型

`CCheckbox` 将作为独立组件实现，不依赖 context 或 group 容器。组件根节点继续使用 `<label>` 包裹原生 `<input type="checkbox">` 与文本内容，这样可以复用现有组件库的低复杂度实现思路，并继承浏览器对点击标签切换输入状态的默认行为。

选择该方案的原因：

- 复选框天然适合单组件表达，一个布尔值即可描述选中状态
- 无需引入 group context、name 同步、value 分发等额外抽象
- 更容易保持与原生表单行为一致，测试模型也更简单

备选方案：引入 `CCheckboxGroup` 或复用 `CRadio` 的上下文模式。未采用，因为提案只要求单个复选框能力，提前设计分组抽象会增加 API 面和维护成本。

### 2. 以 React 常见受控/非受控 API 作为状态模型

组件 props 设计以 `checked`、`defaultChecked`、`onChange` 为核心，并保留 `disabled`、`label`、`children`、`theme`、`data-testid` 等与现有组件一致的输入方式。组件内部应遵循以下规则：

- 提供 `checked` 时进入受控模式，以传入值为准
- 仅提供 `defaultChecked` 时进入非受控模式，由内部状态维护当前值
- 用户交互时统一通过 `onChange` 对外抛出最新布尔状态
- `children` 优先于 `label` 作为展示文本，与 `CRadio` 保持一致

选择该方案的原因：

- 与 React 原生复选框心智模型一致，使用方无需学习额外 API
- 能覆盖表单受控场景和轻量交互场景
- 与 `CRadioGroup` 当前测试风格兼容，便于编写稳定测试

备选方案：仅支持受控模式，或只暴露布尔切换回调而不支持 `defaultChecked`。未采用，因为会限制简单场景的使用便利性，并使组件能力弱于常见表单组件预期。

### 3. 样式与主题能力沿用现有组件模式

`CCheckbox` 将沿用现有组件模式，在组件文件内引入局部 `index.scss`，通过 `mergeClasses` 合并基础类名和主题类名。禁用态通过修饰类表达，例如 `cm-checkbox--disabled`，避免引入内联样式或额外样式系统。

选择该方案的原因：

- 与项目现有约束一致，避免 CSS-in-JS 或额外样式依赖
- 保证不同主题下的类名输出稳定，便于后续主题扩展
- 与测试断言方式一致，可直接验证根节点类名

备选方案：直接复用浏览器默认复选框样式、不提供组件级 class 体系。未采用，因为这会削弱组件库的统一视觉能力，也不利于主题定制。

### 4. 公共导出与测试覆盖作为交付的一部分

实现时需要同时更新 `src/components/index.ts` 与 `src/index.ts`，确保 `CCheckbox` 和其 props 类型可以从包入口直接导入。测试覆盖将对齐现有 `Radio.test.tsx` 的风格，至少覆盖：

- 组件通过包入口导出
- 非受控模式下的初始值和点击切换
- 受控模式下由外部值驱动显示，并通过回调通知变化
- 禁用态不响应交互
- 显式主题或主题提供器下的类名注入

选择该方案的原因：

- 公共入口导出是 spec 中的对外契约，不应依赖消费者访问内部路径
- 测试直接绑定交付要求，可降低后续重构回归风险

备选方案：只添加组件实现，不为包入口和主题能力补测试。未采用，因为这会让公共 API 契约缺少保护。

## Risks / Trade-offs

- [受控与非受控切换逻辑复杂] → 参考现有测试风格，明确受控优先级，并通过 rerender 场景验证状态来源
- [样式命名不一致导致主题难以复用] → 约束使用 `cm-checkbox` 前缀及元素/修饰类命名，保持与现有组件一致
- [标签文本来源不一致影响可访问名称] → 统一采用 `children ?? label` 生成标签内容，并通过 `getByRole('checkbox', { name })` 测试校验
- [过早设计分组能力导致 API 膨胀] → 本次只交付单组件，未来如确有需求再基于真实场景扩展 `CheckboxGroup`

## Migration Plan

- 先新增 `src/components/Checkbox/` 目录下的组件实现、样式和导出文件
- 再接入 `src/components/index.ts` 与 `src/index.ts`
- 补充 `tests/Checkbox.test.tsx` 覆盖公共导出、交互、禁用态与主题类名
- 最后运行 lint、test 和 build 验证组件库对外行为
- 若需要回滚，可直接移除 `CCheckbox` 相关源码、样式、测试和导出，不影响现有组件 API

## Open Questions

- 当前提案未要求 `indeterminate`，后续若有设计稿或业务需求，再决定是否通过 prop 暴露该能力
- 当前提案未要求自定义 `className` 能力；是否需要与部分现有组件保持一致，可在实现阶段结合现有模式再确认
