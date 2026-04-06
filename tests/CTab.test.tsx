import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CTab as PackageEntryCTab, CTabItem as PackageEntryCTabItem, type CTabProps } from '../src';
import { CTab } from '../src/components/Tab/CTab';
import { CTabItem, type CTabItemProps } from '../src/components/Tab/CTabItem';

describe('CTab', () => {
  it('exports CTab and CTabItem from package entry', () => {
    expect(PackageEntryCTab).toBe(CTab);
    expect(PackageEntryCTabItem).toBe(CTabItem);
  });

  it('supports CTabProps and CTabItemProps types', () => {
    const tabProps: CTabProps = {
      children: null,
      className: 'custom-tab',
      theme: 'cm-theme--win98',
      'data-testid': 'tab-root',
    };
    const tabItemProps: CTabItemProps = {
      title: 'Title',
      children: <span>Content</span>,
    };

    expect(tabProps.className).toBe('custom-tab');
    expect(tabItemProps.title).toBe('Title');
  });

  it('renders tabs from direct CTabItem children only', () => {
    render(
      <CTab data-testid="tab-root">
        <CTabItem title="Tab One">
          <div>Panel One</div>
        </CTabItem>
        <div>Ignored Node</div>
        <CTabItem title="Tab Two">
          <div>Panel Two</div>
        </CTabItem>
      </CTab>,
    );

    expect(screen.getByTestId('tab-root')).toHaveClass('cm-ctab');
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
    expect(screen.queryByText('Ignored Node')).not.toBeInTheDocument();
  });

  it('defaults to the first tab and switches on click', () => {
    render(
      <CTab data-testid="tab-switch">
        <CTabItem title="Alpha">
          <div>Alpha Panel</div>
        </CTabItem>
        <CTabItem title="Beta">
          <div>Beta Panel</div>
        </CTabItem>
      </CTab>,
    );

    const alphaTab = screen.getByRole('tab', { name: 'Alpha' });
    const betaTab = screen.getByRole('tab', { name: 'Beta' });

    expect(alphaTab).toHaveAttribute('aria-selected', 'true');
    expect(betaTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Alpha Panel');

    fireEvent.click(betaTab);

    expect(alphaTab).toHaveAttribute('aria-selected', 'false');
    expect(betaTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Beta Panel');
  });

  it('connects tabs and panels with ARIA attributes', () => {
    render(
      <CTab data-testid="tab-a11y">
        <CTabItem title="First">
          <div>First Panel</div>
        </CTabItem>
        <CTabItem title="Second">
          <div>Second Panel</div>
        </CTabItem>
      </CTab>,
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    const firstPanel = screen.getByRole('tabpanel');

    expect(firstTab).toHaveAttribute('id');
    expect(firstTab).toHaveAttribute('aria-controls', firstPanel.getAttribute('id') ?? '');
    expect(firstPanel).toHaveAttribute('aria-labelledby', firstTab.getAttribute('id') ?? '');
    expect(firstPanel).toHaveTextContent('First Panel');
  });

  it('keeps tab and panel ids unique for distinct special-character keys', () => {
    render(
      <CTab>
        <CTabItem key="alpha/beta" title="Slash Key">
          <div>Slash Panel</div>
        </CTabItem>
        <CTabItem key="alpha?beta" title="Question Key">
          <div>Question Panel</div>
        </CTabItem>
      </CTab>,
    );

    const tabs = screen.getAllByRole('tab');
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    const tabIds = tabs.map((tab) => tab.getAttribute('id'));
    const panelIds = panels.map((panel) => panel.getAttribute('id'));

    expect(new Set(tabIds).size).toBe(tabIds.length);
    expect(new Set(panelIds).size).toBe(panelIds.length);
    expect(tabs[0]).toHaveAttribute('aria-controls', panelIds[0] ?? '');
    expect(tabs[1]).toHaveAttribute('aria-controls', panelIds[1] ?? '');
  });
});
