
- 预览态 ownership 固定在 `Widget` 几何层，`WindowTitle` 只保留触发/回调职责。
- `moveBehavior` 与 `resizeBehavior` 为独立 props，默认值都应保持 `live`。
- preview DOM 契约固定为 `data-testid="window-preview-frame"`，供 Jest 与 Playwright 统一读取。
- Demo / Playwright harness 需要显式启用 outline fixtures，库默认行为不能改成 outline。
- 本任务只冻结 API 与 preview 合约，不改变现有 committed frame 更新路径；即便显式传入 `outline`，当前 move/resize 仍保持 live 提交，等待后续任务接入真实 preview 生命周期。
- preview ownership 固定在 `Widget`，并由 `setPreviewState` / `setPreviewRect` / `clearPreviewState` 与 `renderPreviewFrame()` 形成唯一入口，避免 `WindowTitle` 或其它组合层重复持有几何预览状态。
- cancel 语义继续沿现有 drag 生命周期扩展：move 用 `CWindowTitle` 本地 cancel flag，resize 用 `Widget` 按方向 cancel set；两者都只做“显式取消抑制 commit + 清 preview”，不新增第三种交互模式，也不改变正常 release-only commit 规则。
