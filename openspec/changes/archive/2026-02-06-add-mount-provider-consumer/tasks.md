## 1. Mount Point Infrastructure

- [x] 1.1 Add global mount registry module with name uniqueness and lifecycle helpers
- [x] 1.2 Implement MountProvider component with register/unregister behavior
- [x] 1.3 Implement MountConsumer HOC with portal rendering, exclude, and priority rules

## 2. Types & Exports

- [x] 2.1 Define public types for MountProvider/MountConsumer props and registry entries
- [x] 2.2 Export new components from `src/components/index.ts` and `src/index.ts`

## 3. Demo & Theme Behavior

- [x] 3.1 Extend theme behavior types to include start menu mount position
- [x] 3.2 Update default/win98/winxp themes with mount position configuration
- [x] 3.3 Update `src/dev/main.tsx` layout to create five mount points and mount start menu by theme

## 4. Verification

- [x] 4.1 Add or update tests for mount registry and exclusion/priority rules (or document gaps)
- [x] 4.2 Run lint/test/build to confirm no regressions
