const { render, screen, fireEvent } = require('@testing-library/react')
require('@testing-library/jest-dom')
const { WindowMenu } = require('./src')

const onUndo = jest.fn()
const items = [
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', onSelect: onUndo },
      { id: 'redo', label: 'Redo' }
    ]
  }
]

render({ WindowMenu, items, className: '', focusBehavior: { open: 'parent', close: 'parent' } })

fireEvent.click(screen.getByText('Edit'))
console.log('After click:', document.activeElement?.textContent)

fireEvent.keyDown(document.activeElement || document.body, { key: 'ArrowRight' })
console.log('After ArrowRight:', document.activeElement?.textContent)

fireEvent.keyDown(document.activeElement || document.body, { key: 'Enter' })
console.log('After Enter:', onUndo.mock.calls)
