# Task 3: Picker Outside-Click Close — Evidence

## Test: outside mousedown closes panel and fires onOpenChange(false)

### CDatePicker
- Render `<CDatePicker defaultOpen>` with `onOpenChange` mock
- Assert panel is in the document
- `fireEvent.mouseDown(document.body)` — fires the document-level mousedown listener
- Assert panel is removed from document
- Assert `onOpenChange` called exactly once with `false`

### CTimePicker
- Same pattern: render `<CTimePicker defaultOpen>` with `onOpenChange` mock
- `fireEvent.mouseDown(document.body)`
- Assert panel removed, `onOpenChange(false)` called exactly once

### Controlled mode (both pickers)
- Render with `open={true}` + `onOpenChange` mock
- `fireEvent.mouseDown(document.body)`
- Assert `onOpenChange(false)` called once
- Assert panel still mounted (parent hasn't rerendered)
- Rerender with `open={false}` → panel unmounts

### No listener when closed
- Render with panel closed (no `defaultOpen`)
- `fireEvent.mouseDown(document.body)`
- Assert `onOpenChange` NOT called

## Implementation pattern (matches CMenu)
```tsx
const rootRef = React.useRef<HTMLDivElement>(null); // or HTMLFieldSetElement

React.useEffect(() => {
  if (!isOpen) return;
  const handleDocumentMouseDown = (event: MouseEvent): void => {
    if (!(event.target instanceof Node)) return;
    if (rootRef.current !== null && !rootRef.current.contains(event.target)) {
      setOpenState(false);
    }
  };
  document.addEventListener('mousedown', handleDocumentMouseDown);
  return () => { document.removeEventListener('mousedown', handleDocumentMouseDown); };
}, [isOpen, setOpenState]);
```

## Result
All 45 tests pass (5 new outside-click tests + 40 existing). Lint clean.
