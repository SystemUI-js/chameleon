# Task 3: Picker Inside-Click Stays Open — Evidence

## Test: mousedown inside input or panel does NOT close

### CDatePicker — input
- Render `<CDatePicker defaultOpen>` with `onOpenChange` mock
- `fireEvent.mouseDown(input)` — input is inside rootRef
- Assert panel still in document
- Assert `onOpenChange` NOT called

### CDatePicker — panel
- `fireEvent.mouseDown(panel)` — panel div is inside rootRef
- Assert panel still in document
- Assert `onOpenChange` NOT called

### CTimePicker — input
- Render `<CTimePicker defaultOpen>` with `onOpenChange` mock
- `fireEvent.mouseDown(input)` — input is inside rootRef (fieldset)
- Assert panel still in document
- Assert `onOpenChange` NOT called

### CTimePicker — panel
- `fireEvent.mouseDown(panel)` — panel div is inside rootRef
- Assert panel still in document
- Assert `onOpenChange` NOT called

## Why it works
`rootRef.current.contains(event.target)` returns `true` for any node inside the root wrapper (input, clear button, panel, panel children), so the outside-click handler early-exits without calling `setOpenState(false)`.

## Result
All 5 inside-click tests pass alongside 40 existing tests. Total: 45/45.
