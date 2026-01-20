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

  const currentPosition = focusable.indexOf(currentIndex)
  const startIndex = currentPosition === -1 ? 0 : currentPosition
  const delta = direction === 'next' ? 1 : -1
  const nextPosition =
    (startIndex + delta + focusable.length) % focusable.length

  return focusable[nextPosition]
}
