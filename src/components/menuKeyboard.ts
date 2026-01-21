import { MenuItem } from './menuTypes'

export const isMenuItemDisabled = (item: MenuItem) =>
  'disabled' in item && Boolean(item.disabled)

export const isDividerItem = (item: MenuItem) =>
  'divider' in item && item.divider

export const getFocusableIndexes = (items: MenuItem[]) =>
  items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isDividerItem(item) && !isMenuItemDisabled(item))
    .map(({ index }) => index)

export const getNextFocusableIndex = (
  items: MenuItem[],
  currentIndex: number,
  direction: 'next' | 'prev'
) => {
  const focusable = getFocusableIndexes(items)
  if (focusable.length === 0) return -1

  // Handle case where currentIndex is not in focusable list
  if (!focusable.includes(currentIndex)) {
    if (direction === 'next') {
      return focusable.find((i) => i > currentIndex) ?? focusable[0]
    }
    const prev =
      [...focusable].reverse().find((i) => i < currentIndex) ??
      focusable[focusable.length - 1]
    return prev
  }

  const currentPosition = focusable.indexOf(currentIndex)
  const delta = direction === 'next' ? 1 : -1
  const nextPosition =
    (currentPosition + delta + focusable.length) % focusable.length

  return focusable[nextPosition]
}
