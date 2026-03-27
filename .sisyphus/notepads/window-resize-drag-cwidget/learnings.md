- `CWidget` 作为交互 frame 基类时，`state` 需要建模成“基类 frame state + 子类额外 state”的泛型组合；否则 `CDock`、`CStartBar` 这类非窗口子类会因为覆盖 `state` 触发继承类型冲突。
- `renderFrame()` 改为逐字段回退到 `this.state` 更稳妥：即使调用方只覆盖部分布局字段，也不会回退到旧的 props 值。
- 把 resize 生命周期上移到 `CWidget` 时，最稳妥的兼容方式是提供 `supportsResize()` 这类受保护钩子；这样 `CDock`、`CStartBar` 等非窗口子类不会因为基类新增 mount/update/unmount 逻辑而意外渲染或绑定 resize 句柄。
- 保留 `window-resize-${dir}` test id 与 edgeInset=`edgeWidth / 2` 的几何公式，可以把 DOM 可观察契约锁定在基类实现里，同时让 `CWindow` 继续只负责窗口结构组合。
- 在 `CWidget` 提供 `mapComposedChildren()` + `isMoveHandleElement()` 后，可以把标题拖拽注入下沉到基类，同时继续复用 `CWindowTitle` 现有的 `onWindowMove` / `getWindowPose` props；这样显式组合的标题仍可拖拽，而 body/content 因未命中检测钩子保持无效。
- F2 静态审查确认 `CWindow` 现在只剩 `supportsResize()`、`isMoveHandleElement()`、少量 className 钩子和 `render()` 结构组合，frame state、resize 几何、Drag 生命周期都已稳定收敛到 `CWidget`。
- F1 审计时要先按计划中的“证据文件名”逐一核对，不能用同前缀但不同任务语义的证据替代（例如 `task-5-theme-scope*` 不能替代 `task-5-playwright-window-regressions*`）。
- F4 审计时不能只看目标文件本身；还要用 commit 级 diff（如 `git diff <base>..<head> --name-only`）确认没有把“为兼容基类改造”扩散到计划未声明的组件文件。
- 对 scope fidelity 的判定要拆成三层：guardrail 关键词（hooks/context/依赖）、可观察契约（test id/selectors/API）、以及变更边界（是否触及计划外文件）。三层任一失败都应阻断。
10: - F3 Real Manual QA 通过 Playwright 验证：default fixture title drag (20,40)→(30,60,240,160) ✓；SE resize (20,10)→(10,20,260,170) ✓；drag-only handles=0 + title drag (30,40)→(42,64,200,120) ✓；min-clamp (E-60,S-70)→(30,30,1,1) ✓；max-clamp (E+100,NW-70,-80)→(50,50,150,110) ✓。
