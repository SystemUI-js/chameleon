import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../src'

describe('ThemeProvider default theme', () => {
  it('uses default theme when defaultTheme prop is not provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme.id).toBe('default')
  })

  it('switches theme via ThemeId', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('win98')
    })

    expect(result.current.theme.id).toBe('win98')
  })
})
