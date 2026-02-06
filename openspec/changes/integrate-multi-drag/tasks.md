## 1. Setup

- [x] 1.1 Add @system-ui-js/multi-drag dependency to package.json
- [x] 1.2 Verify typings/import paths for Drag, DragOperationType, defaultGetPose/defaultSetPose

## 2. Window/Modal Integration

- [x] 2.1 Replace Window move handlers with multi-drag Drag instance
- [x] 2.2 Map interactionMode to setPose/setPoseOnEnd for move
- [x] 2.3 Replace resize handle handlers with Drag instances per direction
- [x] 2.4 Keep Modal behavior consistent by reusing Window implementation

## 3. Splitter Integration

- [x] 3.1 Replace Splitter mousemove logic with multi-drag Drag instance
- [x] 3.2 Preserve delta semantics and keyboard resize behavior

## 4. Tests & Verification

- [x] 4.1 Update Window drag/resize tests to align with new event flow
- [x] 4.2 Update Modal drag/resize tests if needed
- [x] 4.3 Run targeted tests for Window and Modal components
