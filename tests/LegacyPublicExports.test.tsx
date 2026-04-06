import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  CScreen,
  CScreenManager,
  CWindow,
  CWindowManager,
  CWindowTitle,
  DEFAULT_SYSTEM_TYPE,
  SYSTEM_TYPE,
  SystemHost,
  THEME,
  resolveThemeDefinition,
} from '../src';

describe('legacy public exports compatibility', () => {
  it('re-exports manager and system APIs from the package entry', () => {
    expect(CWindowManager).toBeDefined();
    expect(CScreen).toBeDefined();
    expect(CScreenManager).toBeDefined();
    expect(SystemHost).toBeDefined();
    expect(DEFAULT_SYSTEM_TYPE).toBe(SYSTEM_TYPE.default);
    expect(THEME.win98).toBe('win98');
  });

  it('keeps resolveThemeDefinition available for legacy system consumers', () => {
    expect(resolveThemeDefinition({ systemType: SYSTEM_TYPE.windows, theme: THEME.winxp })).toEqual(
      {
        id: 'winxp',
        label: 'Windows XP',
        systemType: 'windows',
        className: 'cm-theme--winxp',
      },
    );
  });

  it('renders legacy SystemHost default shell', () => {
    render(<SystemHost systemType={SYSTEM_TYPE.default} theme={THEME.default} />);

    expect(screen.getByTestId('screen-root')).toHaveAttribute(
      'data-system-type',
      SYSTEM_TYPE.default,
    );
    expect(screen.getByTestId('window-title-text')).toHaveTextContent('Default Window');
    expect(screen.getByTestId('system-switch')).toBeInTheDocument();
  });

  it('renders legacy window and screen managers', () => {
    render(
      <CScreenManager>
        <CScreen>
          <CWindowManager>
            <CWindow>
              <CWindowTitle>Managed Window</CWindowTitle>
            </CWindow>
          </CWindowManager>
        </CScreen>
      </CScreenManager>,
    );

    expect(screen.getByTestId('screen-root')).toBeInTheDocument();
    expect(screen.getByTestId('window-title-text')).toHaveTextContent('Managed Window');
  });
});
