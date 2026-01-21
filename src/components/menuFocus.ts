import { MenuItem } from './menuTypes'
import { getFocusableIndexes } from './menuKeyboard'

export const getFirstFocusableIndex = (items: MenuItem[]) => {
  const indexes = getFocusableIndexes(items)
  return indexes.length > 0 ? indexes[0] : -1
}

export const getLastFocusableIndex = (items: MenuItem[]) => {
  const indexes = getFocusableIndexes(items)
  return indexes.length > 0 ? indexes[indexes.length - 1] : -1
}
