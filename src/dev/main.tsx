import React, { useState } from 'react'
import { winxp } from '../theme/winxp'
import { createRoot } from 'react-dom/client'
import {
  ThemeProvider,
  ThemeId,
  Window,
  Button,
  Input,
  Checkbox,
  Radio,
  Select,
  Tabs,
  WindowMenu,
  useTheme,
  Modal,
  Text,
  Textarea,
  Splitter,
  Collapse,
  Taskbar,
  StartButton
} from '../index'
import '../styles/global.css'
import '../theme/win98/index.scss'
import '../theme/winxp/index.scss'

const Desktop = () => {
  const [activeWindow, setActiveWindow] = useState<string>('controls')
  const [showModal, setShowModal] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--cm-color-background)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Desktop Area */}
      <div style={{ flex: 1, position: 'relative', padding: '20px' }}>
        {/* Controls Window */}
        <Window
          title='Component Gallery'
          style={{
            width: 400,
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: activeWindow === 'controls' ? 10 : 1
          }}
          isActive={activeWindow === 'controls'}
          onMouseDown={() => setActiveWindow('controls')}
          onClose={() => console.log('Close')}
        >
          <WindowMenu
            items={[
              { id: 'file', label: 'File' },
              { id: 'edit', label: 'Edit' },
              { id: 'view', label: 'View' },
              { id: 'help', label: 'Help' }
            ]}
            className='mb-2'
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button variant='primary'>Primary</Button>
              <Button>Secondary</Button>
              <Button disabled>Disabled</Button>
            </div>

            <div
              style={{
                border: '1px solid var(--cm-color-border-dark)',
                padding: '8px'
              }}
            >
              <Text variant='h4' className='mb-2'>
                Form Controls
              </Text>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <Input placeholder='Enter username...' />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Checkbox label='Remember me' defaultChecked />
                  <Checkbox label='Disabled' disabled />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Radio name='opt' label='Option A' defaultChecked />
                  <Radio name='opt' label='Option B' />
                </div>
                <Select
                  options={[
                    { value: 'default', label: 'Default' },
                    { value: 'win98', label: 'Windows 98' },
                    { value: 'winxp', label: 'Windows XP' },
                    { value: 'macos', label: 'macOS (Placeholder)' },
                    { value: 'material', label: 'Material (Placeholder)' }
                  ]}
                  value={theme.id}
                  onChange={(val) => setTheme(val as ThemeId)}
                />
              </div>
            </div>

            <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          </div>
        </Window>

        {/* Layout Window */}
        <Window
          title='Layout & Typography'
          style={{
            width: 450,
            position: 'absolute',
            top: 50,
            left: 450,
            zIndex: activeWindow === 'layout' ? 10 : 1
          }}
          isActive={activeWindow === 'layout'}
          onMouseDown={() => setActiveWindow('layout')}
        >
          <Tabs
            items={[
              {
                id: 'tab1',
                label: 'General',
                content: (
                  <div style={{ height: 150 }}>
                    <Text variant='h3'>Typography</Text>
                    <Text>The quick brown fox jumps over the lazy dog.</Text>
                    <Text bold>Bold text</Text>
                    <Text italic>Italic text</Text>
                    <div style={{ marginTop: 10 }}>
                      <Textarea
                        placeholder='Multi-line text area...'
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )
              },
              {
                id: 'tab2',
                label: 'Advanced',
                content: (
                  <div style={{ height: 150, display: 'flex' }}>
                    <div style={{ flex: 1, padding: 4 }}>Left Pane</div>
                    <Splitter />
                    <div style={{ flex: 1, padding: 4 }}>Right Pane</div>
                  </div>
                )
              },
              {
                id: 'tab3',
                label: 'Collapse',
                content: (
                  <Collapse
                    items={[
                      { id: '1', title: 'Section 1', content: 'Content 1' },
                      { id: '2', title: 'Section 2', content: 'Content 2' }
                    ]}
                    accordion
                  />
                )
              }
            ]}
          />
        </Window>
      </div>

      {/* Taskbar */}
      <Taskbar startButton={<StartButton />}>
        <Button
          className={activeWindow === 'controls' ? 'active' : ''}
          onClick={() => setActiveWindow('controls')}
          style={{
            background:
              activeWindow === 'controls'
                ? 'var(--cm-color-surface-active)'
                : undefined,
            boxShadow:
              activeWindow === 'controls'
                ? 'var(--cm-shadow-inset-bevel)'
                : undefined,
            textAlign: 'left',
            justifyContent: 'flex-start',
            minWidth: 150
          }}
        >
          Component Gallery
        </Button>
        <Button
          className={activeWindow === 'layout' ? 'active' : ''}
          onClick={() => setActiveWindow('layout')}
          style={{
            background:
              activeWindow === 'layout'
                ? 'var(--cm-color-surface-active)'
                : undefined,
            boxShadow:
              activeWindow === 'layout'
                ? 'var(--cm-shadow-inset-bevel)'
                : undefined,
            textAlign: 'left',
            justifyContent: 'flex-start',
            minWidth: 150
          }}
        >
          Layout & Typography
        </Button>
      </Taskbar>

      <Modal
        title='System Error'
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        style={{ width: 300 }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'red',
              borderRadius: '50%',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 20,
              boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.5)'
            }}
          >
            X
          </div>
          <Text>
            A fatal exception 0E has occurred at 0028:C0011E36. The current
            application will be terminated.
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme={winxp}>
        <Desktop />
      </ThemeProvider>
    </React.StrictMode>
  )
}
