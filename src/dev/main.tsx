import { createRoot } from 'react-dom/client'
import { Button } from '../index'

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Chameleon 组件库 - 开发预览</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => alert('Primary')} variant='primary'>
          Primary
        </Button>
        <Button onClick={() => alert('Secondary')} variant='secondary'>
          Secondary
        </Button>
        <Button onClick={() => alert('Text')} variant='text'>
          Text
        </Button>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
