// 导出主题样式，确保它们被包含在库构建中
import './theme/default/index.scss'
import './theme/win98/index.scss'
import './theme/winxp/index.scss'

// 导出组件和主题 API
export * from './theme/ThemeContext'
export * from './theme/types'
export * from './theme/default'
export * from './theme/win98'
export * from './theme/winxp'

export * from './components'
