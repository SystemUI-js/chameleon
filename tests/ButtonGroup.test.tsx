import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { compileString } from 'sass';
import {
  CButton,
  CButtonGroup as PackageEntryCButtonGroup,
  CButtonSeparator as PackageEntryCButtonSeparator,
  Theme,
} from '../src';
import { CButtonGroup } from '../src/components/ButtonGroup/ButtonGroup';
import { CButtonSeparator } from '../src/components/ButtonSeparator/ButtonSeparator';

const themeStylePaths = [
  'src/theme/default/styles/index.scss',
  'src/theme/win98/styles/index.scss',
  'src/theme/winxp/styles/index.scss',
];

let compiledThemeStyleElement: HTMLStyleElement | undefined;
let compiledThemeCss = '';

function ensureCompiledThemeStyles(): void {
  if (compiledThemeStyleElement !== undefined) {
    return;
  }

  compiledThemeCss = compileString(
    themeStylePaths
      .map((relativePath) => readFileSync(resolve(process.cwd(), relativePath), 'utf8'))
      .join('\n'),
  ).css;

  compiledThemeStyleElement = document.createElement('style');
  compiledThemeStyleElement.textContent = compiledThemeCss;
  document.head.appendChild(compiledThemeStyleElement);
}

describe('CButtonGroup and CButtonSeparator', () => {
  beforeAll(() => {
    ensureCompiledThemeStyles();
  });

  afterAll(() => {
    compiledThemeStyleElement?.remove();
    compiledThemeStyleElement = undefined;
    compiledThemeCss = '';
  });

  it('exports CButtonGroup from package entry', () => {
    render(
      <PackageEntryCButtonGroup data-testid="button-group-package-entry">
        <CButton>Package entry</CButton>
      </PackageEntryCButtonGroup>,
    );

    expect(PackageEntryCButtonGroup).toBe(CButtonGroup);
    expect(screen.getByTestId('button-group-package-entry')).toBeInTheDocument();
  });

  it('exports CButtonSeparator from package entry', () => {
    render(<PackageEntryCButtonSeparator data-testid="button-separator-package-entry" />);

    expect(PackageEntryCButtonSeparator).toBe(CButtonSeparator);
    expect(screen.getByTestId('button-separator-package-entry')).toBeInTheDocument();
  });

  it('uses horizontal as the default group orientation', () => {
    render(
      <CButtonGroup data-testid="default-group">
        <CButton data-testid="default-group-button">One</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('default-group')).toHaveClass('cm-button-group--horizontal');
    expect(screen.getByTestId('default-group-button')).toHaveClass('cm-button--group-horizontal');
  });

  it('uses vertical as the default separator orientation', () => {
    render(<CButtonSeparator data-testid="default-separator" />);

    expect(screen.getByTestId('default-separator')).toHaveClass('cm-button-separator--vertical');
  });

  it('applies explicit theme and className to CButtonGroup', () => {
    render(
      <CButtonGroup data-testid="themed-group" className="custom-group" theme="cm-theme--win98">
        <CButton>One</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('themed-group')).toHaveClass('cm-button-group');
    expect(screen.getByTestId('themed-group')).toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('themed-group')).toHaveClass('custom-group');
  });

  it('applies explicit theme and className to CButtonSeparator', () => {
    render(
      <CButtonSeparator
        data-testid="themed-separator"
        className="custom-separator"
        theme="cm-theme--win98"
      />,
    );

    expect(screen.getByTestId('themed-separator')).toHaveClass('cm-button-separator');
    expect(screen.getByTestId('themed-separator')).toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('themed-separator')).toHaveClass('custom-separator');
  });

  it('marks first middle and last grouped buttons', () => {
    render(
      <CButtonGroup>
        <CButton data-testid="grouped-first">One</CButton>
        <CButton data-testid="grouped-middle">Two</CButton>
        <CButton data-testid="grouped-last">Three</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('grouped-first')).toHaveClass('cm-button--group-first');
    expect(screen.getByTestId('grouped-middle')).toHaveClass('cm-button--group-middle');
    expect(screen.getByTestId('grouped-last')).toHaveClass('cm-button--group-last');
  });

  it('marks a single grouped button as single', () => {
    render(
      <CButtonGroup>
        <CButton data-testid="single-grouped-button">One</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('single-grouped-button')).toHaveClass('cm-button--group-single');
  });

  it('applies vertical wrapper modifier', () => {
    render(
      <CButtonGroup data-testid="vertical-group" orientation="vertical">
        <CButton data-testid="vertical-button">One</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('vertical-group')).toHaveClass('cm-button-group--vertical');
    expect(screen.getByTestId('vertical-button')).toHaveClass('cm-button--group-vertical');
  });

  it('unwraps fragment children and ignores nullish children', () => {
    render(
      <CButtonGroup>
        <>
          <CButton data-testid="fragment-first">One</CButton>
          {null}
          {false}
          <CButton data-testid="fragment-last">Two</CButton>
        </>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('fragment-first')).toHaveClass('cm-button--group-first');
    expect(screen.getByTestId('fragment-last')).toHaveClass('cm-button--group-last');
  });

  it('separator resets position markers between button segments', () => {
    render(
      <CButtonGroup>
        <CButton data-testid="segment-before-first">One</CButton>
        <CButton data-testid="segment-before-last">Two</CButton>
        <CButtonSeparator data-testid="segment-separator" />
        <CButton data-testid="segment-after-single">Three</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('segment-before-first')).toHaveClass('cm-button--group-first');
    expect(screen.getByTestId('segment-before-last')).toHaveClass('cm-button--group-last');
    expect(screen.getByTestId('segment-after-single')).toHaveClass('cm-button--group-single');
    expect(screen.getByTestId('segment-separator')).not.toHaveClass('cm-button--grouped');
  });

  it('renders an empty group without crashing', () => {
    render(<CButtonGroup data-testid="empty-group" />);

    expect(screen.getByTestId('empty-group')).toBeEmptyDOMElement();
  });

  it('preserves non-button children unchanged', () => {
    render(
      <CButtonGroup>
        <CButton data-testid="preserved-before">Before</CButton>
        <span data-testid="preserved-custom-child">Custom child</span>
        <CButton data-testid="preserved-after">After</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('preserved-custom-child')).toBeInTheDocument();
    expect(screen.getByTestId('preserved-custom-child')).not.toHaveClass('cm-button--grouped');
    expect(screen.getByTestId('preserved-before')).toHaveClass('cm-button--group-single');
    expect(screen.getByTestId('preserved-after')).toHaveClass('cm-button--group-single');
  });

  it('applies group variant to child buttons without explicit variant', () => {
    render(
      <CButtonGroup variant="primary">
        <CButton data-testid="variant-default-a">One</CButton>
        <CButton data-testid="variant-default-b">Two</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('variant-default-a')).toHaveClass('cm-button--primary');
    expect(screen.getByTestId('variant-default-b')).toHaveClass('cm-button--primary');
  });

  it('child variant overrides group variant', () => {
    render(
      <CButtonGroup variant="primary">
        <CButton data-testid="variant-inherited">One</CButton>
        <CButton data-testid="variant-explicit" variant="ghost">
          Two
        </CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('variant-inherited')).toHaveClass('cm-button--primary');
    expect(screen.getByTestId('variant-explicit')).toHaveClass('cm-button--ghost');
    expect(screen.getByTestId('variant-explicit')).not.toHaveClass('cm-button--primary');
  });

  it('group disabled disables all direct buttons', () => {
    render(
      <CButtonGroup disabled>
        <CButton data-testid="disabled-a">One</CButton>
        <CButton data-testid="disabled-b">Two</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('disabled-a')).toBeDisabled();
    expect(screen.getByTestId('disabled-b')).toBeDisabled();
  });

  it('group disabled blocks child click handlers', () => {
    const handleFirstClick = jest.fn();
    const handleSecondClick = jest.fn();

    render(
      <CButtonGroup disabled>
        <CButton data-testid="blocked-a" onClick={handleFirstClick}>
          One
        </CButton>
        <CButton data-testid="blocked-b" onClick={handleSecondClick}>
          Two
        </CButton>
      </CButtonGroup>,
    );

    fireEvent.click(screen.getByTestId('blocked-a'));
    fireEvent.click(screen.getByTestId('blocked-b'));

    expect(handleFirstClick).not.toHaveBeenCalled();
    expect(handleSecondClick).not.toHaveBeenCalled();
  });

  it('preserves child theme and className when applying group defaults', () => {
    render(
      <CButtonGroup theme="cm-theme--win98" variant="primary">
        <CButton
          data-testid="preserved-child-theme"
          theme="cm-theme--winxp"
          className="child-class"
        >
          One
        </CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('preserved-child-theme')).toHaveClass('cm-theme--winxp');
    expect(screen.getByTestId('preserved-child-theme')).not.toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('preserved-child-theme')).toHaveClass('child-class');
    expect(screen.getByTestId('preserved-child-theme')).toHaveClass('cm-button--primary');
    expect(screen.getByTestId('preserved-child-theme')).toHaveClass('cm-button--grouped');
  });

  it('applies theme styles when the button carries the theme class itself', () => {
    render(
      <CButton data-testid="self-themed-button" theme="cm-theme--win98">
        One
      </CButton>,
    );

    const buttonStyles = window.getComputedStyle(screen.getByTestId('self-themed-button'));

    expect(buttonStyles.minHeight).toBe('23px');
    expect(buttonStyles.borderRadius).toBe('0');
  });

  it('lets child button and separator theme styles override the group theme styles regardless of theme order', () => {
    render(
      <CButtonGroup theme="cm-theme--win98">
        <CButton data-testid="group-themed-button">One</CButton>
        <CButton data-testid="child-themed-button" theme="cm-theme--default">
          Two
        </CButton>
        <CButtonSeparator data-testid="group-themed-separator" />
        <CButtonSeparator data-testid="child-themed-separator" theme="cm-theme--default" />
      </CButtonGroup>,
    );

    const inheritedButtonStyles = window.getComputedStyle(
      screen.getByTestId('group-themed-button'),
    );
    const overriddenButtonStyles = window.getComputedStyle(
      screen.getByTestId('child-themed-button'),
    );
    const inheritedSeparatorStyles = window.getComputedStyle(
      screen.getByTestId('group-themed-separator'),
    );
    const overriddenSeparatorStyles = window.getComputedStyle(
      screen.getByTestId('child-themed-separator'),
    );

    expect(inheritedButtonStyles.minHeight).toBe('23px');
    expect(inheritedButtonStyles.borderRadius).toBe('0');
    expect(overriddenButtonStyles.minHeight).toBe('32px');
    expect(overriddenButtonStyles.borderRadius).toBe('4px');
    expect(inheritedSeparatorStyles.marginLeft).toBe('6px');
    expect(overriddenSeparatorStyles.marginLeft).toBe('8px');
  });

  it('emits grouped focus-visible selectors for self-themed buttons', () => {
    expect(compiledThemeCss).toContain('.cm-theme--default.cm-button--grouped:focus-visible');
    expect(compiledThemeCss).toContain('.cm-theme--win98.cm-button--grouped:focus-visible');
    expect(compiledThemeCss).toContain('.cm-theme--winxp.cm-button--grouped:focus-visible');
  });

  it('inherits group theme when child theme is blank', () => {
    render(
      <CButtonGroup theme="cm-theme--win98">
        <CButton data-testid="blank-child-theme" theme="   ">
          One
        </CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('blank-child-theme')).toHaveClass('cm-theme--win98');
  });

  it('uses horizontal separator when a vertical group omits separator orientation', () => {
    render(
      <CButtonGroup orientation="vertical">
        <CButton>One</CButton>
        <CButtonSeparator data-testid="derived-horizontal-separator" />
        <CButton>Two</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('derived-horizontal-separator')).toHaveClass(
      'cm-button-separator--horizontal',
    );
  });

  it('explicit separator orientation overrides group-derived orientation', () => {
    render(
      <CButtonGroup orientation="vertical">
        <CButton>One</CButton>
        <CButtonSeparator data-testid="explicit-separator" orientation="vertical" />
        <CButton>Two</CButton>
      </CButtonGroup>,
    );

    expect(screen.getByTestId('explicit-separator')).toHaveClass('cm-button-separator--vertical');
    expect(screen.getByTestId('explicit-separator')).not.toHaveClass(
      'cm-button-separator--horizontal',
    );
  });

  it('separator is aria-hidden and non-focusable', () => {
    render(<CButtonSeparator data-testid="a11y-separator" />);

    expect(screen.getByTestId('a11y-separator')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('a11y-separator')).not.toHaveAttribute('tabindex');
  });

  it('separator does not inherit grouped button variant or disabled behavior', () => {
    render(
      <CButtonGroup disabled variant="primary">
        <CButton data-testid="separator-disabled-button">One</CButton>
        <CButtonSeparator data-testid="separator-no-inherit" />
      </CButtonGroup>,
    );

    expect(screen.getByTestId('separator-disabled-button')).toBeDisabled();
    expect(screen.getByTestId('separator-no-inherit')).not.toHaveClass('cm-button--primary');
    expect(screen.getByTestId('separator-no-inherit')).not.toHaveClass('cm-button--grouped');
    expect(screen.getByTestId('separator-no-inherit')).not.toHaveAttribute('disabled');
  });

  it('inherits Theme provider for grouped buttons', () => {
    render(
      <Theme name="win98">
        <CButtonGroup data-testid="provider-group">
          <CButton data-testid="provider-group-button">One</CButton>
        </CButtonGroup>
      </Theme>,
    );

    expect(screen.getByTestId('provider-group')).toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('provider-group-button')).toHaveClass('cm-theme--win98');
  });

  it('explicit group theme overrides Theme provider', () => {
    render(
      <Theme name="win98">
        <CButtonGroup data-testid="override-group" theme="cm-theme--winxp">
          <CButton data-testid="override-group-button">One</CButton>
        </CButtonGroup>
      </Theme>,
    );

    expect(screen.getByTestId('override-group')).toHaveClass('cm-theme--winxp');
    expect(screen.getByTestId('override-group')).not.toHaveClass('cm-theme--win98');
    expect(screen.getByTestId('override-group-button')).toHaveClass('cm-theme--winxp');
    expect(screen.getByTestId('override-group-button')).not.toHaveClass('cm-theme--win98');
  });

  it('explicit separator theme overrides Theme provider', () => {
    render(
      <Theme name="win98">
        <CButtonGroup>
          <CButton>One</CButton>
          <CButtonSeparator data-testid="override-separator-theme" theme="cm-theme--winxp" />
        </CButtonGroup>
      </Theme>,
    );

    expect(screen.getByTestId('override-separator-theme')).toHaveClass('cm-theme--winxp');
    expect(screen.getByTestId('override-separator-theme')).not.toHaveClass('cm-theme--win98');
  });

  it('applies horizontal and vertical orientation classes needed by theme styles', () => {
    render(
      <div>
        <CButtonGroup>
          <CButton data-testid="horizontal-style-button">One</CButton>
          <CButtonSeparator data-testid="horizontal-style-separator" />
        </CButtonGroup>
        <CButtonGroup orientation="vertical">
          <CButton data-testid="vertical-style-button">Two</CButton>
          <CButtonSeparator data-testid="vertical-style-separator" />
        </CButtonGroup>
      </div>,
    );

    expect(screen.getByTestId('horizontal-style-button')).toHaveClass(
      'cm-button--group-horizontal',
    );
    expect(screen.getByTestId('horizontal-style-separator')).toHaveClass(
      'cm-button-separator--vertical',
    );
    expect(screen.getByTestId('vertical-style-button')).toHaveClass('cm-button--group-vertical');
    expect(screen.getByTestId('vertical-style-separator')).toHaveClass(
      'cm-button-separator--horizontal',
    );
  });
});
