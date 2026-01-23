import '@testing-library/jest-dom'

if (
  typeof window !== 'undefined' &&
  typeof window.PointerEvent === 'undefined'
) {
  window.PointerEvent = window.MouseEvent as unknown as typeof PointerEvent
}
