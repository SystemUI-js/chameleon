import React, { useState } from 'react'
import { defaultTheme } from '../theme/default'
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
  StartButton,
  MountProvider,
  MountConsumer
} from '../index'
import '../styles/global.css'
import '../theme/win98/index.scss'
import '../theme/winxp/index.scss'

const Desktop = () => {
  const [activeWindow, setActiveWindow] = useState<string>('controls')
  const [showModal, setShowModal] = useState(false)
  const { theme, setTheme } = useTheme()
  const noop = () => {}
  const startMenuSlot =
    theme.behavior.startMenuMount === 'top' ? 'layout-top' : 'layout-bottom'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--cm-color-background)',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: 'auto 1fr auto'
      }}
    >
      <MountProvider
        name='layout-top'
        style={{ gridRow: 1, gridColumn: '1 / 4', zIndex: 20 }}
      />
      <MountProvider name='layout-left' style={{ gridRow: 2, gridColumn: 1 }} />
      <MountProvider
        name='layout-center'
        style={{
          gridRow: 2,
          gridColumn: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '20px',
            height: '100%',
            width: '100%'
          }}
        >
          {/* Controls Window */}
          <Window
            title='Component Gallery'
            resizable
            style={{
              width: 400,
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: activeWindow === 'controls' ? 10 : 1
            }}
            isActive={activeWindow === 'controls'}
            onActive={() => setActiveWindow('controls')}
            onClose={noop}
          >
            <WindowMenu
              items={[
                {
                  id: 'file',
                  label: 'File',
                  children: [
                    {
                      id: 'file-new',
                      label: 'New',
                      onSelect: noop
                    },
                    {
                      id: 'file-open',
                      label: 'Open',
                      onSelect: noop
                    },
                    { id: 'file-divider-1', divider: true },
                    {
                      id: 'file-recent',
                      label: 'Recent',
                      children: [
                        {
                          id: 'file-recent-1',
                          label: 'Project A',
                          onSelect: noop
                        },
                        {
                          id: 'file-recent-2',
                          label: 'Project B',
                          onSelect: noop
                        }
                      ]
                    },
                    { id: 'file-divider-2', divider: true },
                    {
                      id: 'file-exit',
                      label: 'Exit',
                      onSelect: noop
                    }
                  ]
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  children: [
                    {
                      id: 'edit-undo',
                      label: 'Undo',
                      onSelect: noop
                    },
                    {
                      id: 'edit-redo',
                      label: 'Redo',
                      onSelect: noop
                    },
                    { id: 'edit-divider-1', divider: true },
                    {
                      id: 'edit-cut',
                      label: 'Cut',
                      onSelect: noop
                    },
                    {
                      id: 'edit-copy',
                      label: 'Copy',
                      onSelect: noop
                    },
                    {
                      id: 'edit-paste',
                      label: 'Paste',
                      onSelect: noop
                    }
                  ]
                },
                {
                  id: 'view',
                  label: 'View',
                  children: [
                    {
                      id: 'view-zoom',
                      label: 'Zoom',
                      children: [
                        {
                          id: 'view-zoom-in',
                          label: 'Zoom In',
                          onSelect: noop
                        },
                        {
                          id: 'view-zoom-out',
                          label: 'Zoom Out',
                          onSelect: noop
                        },
                        {
                          id: 'view-zoom-reset',
                          label: 'Reset Zoom',
                          onSelect: noop
                        }
                      ]
                    },
                    {
                      id: 'view-fullscreen',
                      label: 'Full Screen',
                      onSelect: noop
                    }
                  ]
                },
                {
                  id: 'help',
                  label: 'Help',
                  children: [
                    {
                      id: 'help-about',
                      label: 'About',
                      onSelect: noop
                    }
                  ]
                }
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
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
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
            resizable
            style={{
              width: 450,
              position: 'absolute',
              top: 50,
              left: 450,
              zIndex: activeWindow === 'layout' ? 10 : 1
            }}
            isActive={activeWindow === 'layout'}
            onActive={() => setActiveWindow('layout')}
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
      </MountProvider>
      <MountProvider
        name='layout-right'
        style={{ gridRow: 2, gridColumn: 3 }}
      />
      <MountProvider
        name='layout-bottom'
        style={{ gridRow: 3, gridColumn: '1 / 4', zIndex: 20 }}
      />

      <MountConsumer name={startMenuSlot} exclude priority={0}>
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
      </MountConsumer>

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
      <ThemeProvider defaultTheme={defaultTheme}>
        <Desktop />
      </ThemeProvider>
    </React.StrictMode>
  )
}
