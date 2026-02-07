## 1. Layering foundations

- [x] 1.1 Define z-index tokens for priority groups (base, always-top, anchors, popups) in the shared style/token source
- [x] 1.2 Map existing hard-coded z-index values to tokens and document defaults

## 2. Mount layer structure

- [x] 2.1 Add top-level mount containers for base/always-top/anchors/popups in the root layout
- [x] 2.2 Update MountProvider/MountConsumer usage to place anchored components into the anchors layer
- [x] 2.3 Route overlay portals (ContextMenu/Popover/Modal) to the popups mount layer

## 3. Stacking behavior

- [x] 3.1 Implement last-active stacking within each priority group (window and overlay groups)
- [x] 3.2 Remove or reduce ad-hoc z-index escalation (e.g., drag preview, theme overrides) in favor of the new stack manager

## 4. Verification and regression coverage

- [x] 4.1 Update dev demo to validate menu/popover ordering above windows
- [x] 4.2 Add/adjust tests for window title context menu layering
- [x] 4.3 Run lint/test/build and document any pre-existing failures
