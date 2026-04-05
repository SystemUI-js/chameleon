import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  CButton,
  CDock,
  CGrid,
  CGridItem,
  CRadio,
  CRadioGroup,
  CSelect,
  CStartBar,
  CWidget,
  CWindow,
  CWindowBody,
  CWindowTitle,
  Theme,
} from '../src';
import { Theme as DirectTheme } from '../src/components';
import { CButton as DirectCButton } from '../src/components/Button/Button';
import { CRadio as DirectCRadio } from '../src/components/Radio/Radio';
import { CRadioGroup as DirectCRadioGroup } from '../src/components/Radio/RadioGroup';
import { CSelect as DirectCSelect } from '../src/components/Select/Select';

const SELECT_OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
] as const;

describe('public package entry exports', () => {
  it('keeps Theme and existing entry exports stable', () => {
    expect(Theme).toBe(DirectTheme);
    expect(CButton).toBe(DirectCButton);
    expect(CRadio).toBe(DirectCRadio);
    expect(CRadioGroup).toBe(DirectCRadioGroup);
    expect(CSelect).toBe(DirectCSelect);
  });
});

describe('public component theme matrix', () => {
  it('covers Theme provider inheritance', () => {
    render(
      <Theme name="win98">
        <CButton data-testid="theme-matrix-provider-button">Provider Theme</CButton>
      </Theme>,
    );

    const providerWrapper = screen.getByTestId('theme-matrix-provider-button')
      .parentElement as HTMLElement;

    expect(providerWrapper).toHaveClass('cm-theme--win98');
    expect(providerWrapper).not.toHaveClass('win98');
    expect(screen.getByTestId('theme-matrix-provider-button')).toHaveClass('cm-theme--win98');
  });

  it('normalizes provider wrapper and window/grid chain themes', () => {
    const { container } = render(
      <Theme name="win98">
        <CGrid grid={[1, 1]}>
          <CWindow>
            <CWindowTitle>Window</CWindowTitle>
          </CWindow>
        </CGrid>
      </Theme>,
    );

    const providerWrapper = container.firstElementChild as HTMLElement;
    const grid = container.querySelector('.cm-grid') as HTMLElement;
    const windowFrame = screen.getByTestId('window-frame');
    const windowContent = screen.getByTestId('window-content');

    expect(providerWrapper).toHaveClass('cm-theme--win98');
    expect(providerWrapper).not.toHaveClass('win98');
    expect(grid).toHaveClass('cm-grid', 'cm-theme--win98');
    expect(grid).not.toHaveClass('win98');
    expect(windowFrame).toHaveClass('cm-theme--win98');
    expect(windowFrame).not.toHaveClass('win98');
    expect(windowContent).toHaveClass('cm-theme--win98');
    expect(windowContent).not.toHaveClass('win98');
  });

  it('covers CButton explicit theme', () => {
    render(
      <CButton data-testid="theme-matrix-button" theme="cm-theme--win98">
        Button
      </CButton>,
    );

    expect(screen.getByTestId('theme-matrix-button')).toHaveClass('cm-theme--win98');
  });

  it('covers CDock explicit theme', () => {
    render(<CDock data-testid="theme-matrix-dock" defaultHeight={24} theme="cm-theme--win98" />);

    expect(screen.getByTestId('theme-matrix-dock')).toHaveClass('cm-theme--win98');
  });

  it('covers CGrid and CGridItem explicit theme', () => {
    const { container } = render(
      <CGrid grid={[1, 1]} theme="cm-theme--win98">
        <CGridItem
          className="theme-matrix-grid-item"
          parentGrid={[1, 1]}
          grid={[1, 2, 1, 2]}
          theme="cm-theme--winxp"
        >
          Cell
        </CGridItem>
      </CGrid>,
    );

    expect(container.querySelector('.cm-grid')).toHaveClass('cm-theme--win98');
    expect(container.querySelector('.theme-matrix-grid-item')).toHaveClass('cm-theme--winxp');
  });

  it('covers CRadioGroup and CRadio theme inheritance/override', () => {
    render(
      <Theme name="win98">
        <CRadioGroup data-testid="theme-matrix-radio-group" name="fruit" theme="cm-theme--winxp">
          <CRadio data-testid="theme-matrix-radio" value="apple">
            Apple
          </CRadio>
        </CRadioGroup>
      </Theme>,
    );

    const radio = screen.getByTestId('theme-matrix-radio');
    const radioRoot = radio.closest('.cm-radio');

    expect(screen.getByTestId('theme-matrix-radio-group')).toHaveClass('cm-theme--winxp');
    expect(radioRoot).toHaveClass('cm-theme--win98');
  });

  it('covers CSelect explicit theme', () => {
    render(
      <CSelect
        data-testid="theme-matrix-select"
        options={SELECT_OPTIONS}
        value="apple"
        theme="cm-theme--win98"
      />,
    );

    expect(screen.getByTestId('theme-matrix-select')).toHaveClass('cm-theme--win98');
  });

  it('covers CStartBar explicit theme', () => {
    render(
      <CStartBar data-testid="theme-matrix-startbar" defaultHeight={24} theme="cm-theme--win98" />,
    );

    expect(screen.getByTestId('theme-matrix-startbar')).toHaveClass('cm-theme--win98');
  });

  it('covers CWidget explicit theme', () => {
    render(<CWidget theme="cm-theme--win98" />);

    expect(screen.getByTestId('widget-frame')).toHaveClass('cm-theme--win98');
  });

  it('covers CWindow explicit theme', () => {
    render(
      <CWindow theme="cm-theme--win98">
        <CWindowTitle>Window</CWindowTitle>
      </CWindow>,
    );

    expect(screen.getByTestId('window-frame')).toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('window-content')).toHaveClass('cm-theme--win98');
  });

  it('covers CWindowBody explicit theme', () => {
    render(<CWindowBody theme="cm-theme--win98">Body</CWindowBody>);

    expect(screen.getByTestId('window-body')).toHaveClass('cm-theme--win98');
  });

  it('covers CWindowTitle explicit theme', () => {
    render(<CWindowTitle theme="cm-theme--win98">Title</CWindowTitle>);

    expect(screen.getByTestId('window-title')).toHaveClass('cm-theme--win98');
  });
});
