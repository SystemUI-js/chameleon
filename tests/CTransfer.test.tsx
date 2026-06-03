import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CTransfer as PackageEntryCTransfer, Theme } from '../src';
import { CTransfer, type CTransferItem } from '../src/components/Transfer/CTransfer';

const TEST_ITEMS: readonly CTransferItem[] = [
  { key: 'alpha', title: 'Alpha', description: 'First item' },
  { key: 'beta', title: 'Beta', description: 'Second item' },
  { key: 'gamma', title: 'Gamma' },
];

const TEST_ITEMS_WITH_DISABLED: readonly CTransferItem[] = [
  { key: 'alpha', title: 'Alpha', description: 'First item' },
  { key: 'beta', title: 'Beta', description: 'Second item', disabled: true },
  { key: 'gamma', title: 'Gamma' },
];

const getOption = (name: string): HTMLElement => {
  const textNode = screen.getByText(name);
  const option = textNode.closest('[role="option"]');

  if (!(option instanceof HTMLElement)) {
    throw new Error(`Missing option for ${name}`);
  }

  return option;
};

describe('CTransfer', () => {
  it('exports CTransfer from package entry matching the direct component import', () => {
    render(<PackageEntryCTransfer dataSource={TEST_ITEMS} data-testid="transfer-package-entry" />);

    const transfer = screen.getByTestId('transfer-package-entry');

    expect(PackageEntryCTransfer).toBe(CTransfer);
    expect(transfer).toBeInTheDocument();
    expect(transfer).toHaveClass('cm-transfer');
  });

  it('merges theme and custom className on the root element', () => {
    render(
      <Theme name="win98">
        <CTransfer
          dataSource={TEST_ITEMS}
          className="custom-transfer"
          data-testid="transfer-themed"
        />
      </Theme>,
    );

    const transfer = screen.getByTestId('transfer-themed');

    expect(transfer).toHaveClass('cm-transfer');
    expect(transfer).toHaveClass('cm-theme--win98');
    expect(transfer).toHaveClass('custom-transfer');
  });

  it('uses explicit theme prop over Theme provider', () => {
    render(
      <Theme name="win98">
        <CTransfer dataSource={TEST_ITEMS} theme="cm-theme--winxp" data-testid="transfer-theme" />
      </Theme>,
    );

    const transfer = screen.getByTestId('transfer-theme');

    expect(transfer).toHaveClass('cm-theme--winxp');
    expect(transfer).not.toHaveClass('cm-theme--win98');
  });

  it('renders custom titles and ARIA listbox state', () => {
    render(
      <CTransfer
        dataSource={TEST_ITEMS}
        defaultTargetKeys={['beta']}
        titles={['Available', 'Chosen']}
      />,
    );

    const sourceList = screen.getByRole('listbox', { name: 'Available' });
    const targetList = screen.getByRole('listbox', { name: 'Chosen' });

    expect(sourceList).toHaveAttribute('aria-multiselectable', 'true');
    expect(targetList).toHaveAttribute('aria-multiselectable', 'true');
    expect(within(sourceList).getAllByRole('option')).toHaveLength(2);
    expect(within(targetList).getAllByRole('option')).toHaveLength(1);
    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'false');
  });

  it('moves selected source items to target and fires onChange', () => {
    const onChange = jest.fn();

    render(<CTransfer dataSource={TEST_ITEMS} onChange={onChange} />);

    fireEvent.click(getOption('Alpha'));
    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Move selected to target' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['alpha'], 'right', ['alpha']);
    expect(screen.getAllByRole('listbox')[1]).toHaveTextContent('Alpha');
  });

  it('moves all source items and all target items with double-arrow controls', () => {
    const onChange = jest.fn();

    render(<CTransfer dataSource={TEST_ITEMS} defaultTargetKeys={['beta']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move all to target' }));
    expect(onChange).toHaveBeenLastCalledWith(['beta', 'alpha', 'gamma'], 'right', [
      'alpha',
      'gamma',
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Move all to source' }));
    expect(onChange).toHaveBeenLastCalledWith([], 'left', ['alpha', 'beta', 'gamma']);
  });

  it('moves selected target items back to source', () => {
    const onChange = jest.fn();

    render(
      <CTransfer
        dataSource={TEST_ITEMS}
        defaultTargetKeys={['alpha', 'beta']}
        onChange={onChange}
      />,
    );

    fireEvent.click(getOption('Beta'));
    fireEvent.click(screen.getByRole('button', { name: 'Move selected to source' }));

    expect(onChange).toHaveBeenCalledWith(['alpha'], 'left', ['beta']);
    expect(screen.getAllByRole('listbox')[0]).toHaveTextContent('Beta');
  });

  it('supports controlled targetKeys without mutating visible state before rerender', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <CTransfer dataSource={TEST_ITEMS} targetKeys={['beta']} onChange={onChange} />,
    );

    fireEvent.click(getOption('Alpha'));
    fireEvent.click(screen.getByRole('button', { name: 'Move selected to target' }));

    expect(onChange).toHaveBeenCalledWith(['beta', 'alpha'], 'right', ['alpha']);
    expect(screen.getAllByRole('listbox')[0]).toHaveTextContent('Alpha');

    rerender(<CTransfer dataSource={TEST_ITEMS} targetKeys={['beta', 'alpha']} />);

    expect(screen.getAllByRole('listbox')[1]).toHaveTextContent('Alpha');
  });

  it('uses render prop for custom item content', () => {
    const renderItem = jest.fn((item: CTransferItem) => (
      <span data-testid={`custom-${item.key}`}>{item.title} custom</span>
    ));

    render(<CTransfer dataSource={TEST_ITEMS} render={renderItem} />);

    expect(renderItem).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('custom-alpha')).toHaveTextContent('Alpha custom');
  });

  it('supports controlled selectedKeys and reports source and target selection changes', () => {
    const onSelectChange = jest.fn();
    const { rerender } = render(
      <CTransfer
        dataSource={TEST_ITEMS}
        defaultTargetKeys={['beta']}
        selectedKeys={['alpha', 'beta']}
        onSelectChange={onSelectChange}
      />,
    );

    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'true');
    expect(getOption('Beta')).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(getOption('Gamma'));

    expect(onSelectChange).toHaveBeenCalledWith(['alpha', 'gamma'], ['beta']);
    expect(getOption('Gamma')).toHaveAttribute('aria-selected', 'false');

    rerender(
      <CTransfer dataSource={TEST_ITEMS} defaultTargetKeys={['beta']} selectedKeys={['gamma']} />,
    );

    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'false');
    expect(getOption('Gamma')).toHaveAttribute('aria-selected', 'true');
  });

  it('selects all enabled visible items per panel', () => {
    const onSelectChange = jest.fn();

    render(<CTransfer dataSource={TEST_ITEMS_WITH_DISABLED} onSelectChange={onSelectChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all source items' }));

    expect(onSelectChange).toHaveBeenCalledWith(['alpha', 'gamma'], []);
    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'true');
    expect(getOption('Beta')).toHaveAttribute('aria-selected', 'false');
    expect(getOption('Gamma')).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled items when moving selected keys and marks disabled items', () => {
    const onChange = jest.fn();

    render(
      <CTransfer
        dataSource={TEST_ITEMS_WITH_DISABLED}
        defaultSelectedKeys={['alpha', 'beta']}
        onChange={onChange}
      />,
    );

    expect(getOption('Beta')).toHaveClass('cm-transfer__item--disabled');
    expect(getOption('Beta')).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Move selected to target' }));

    expect(onChange).toHaveBeenCalledWith(['alpha'], 'right', ['alpha']);
    expect(screen.getAllByRole('listbox')[1]).toHaveTextContent('Alpha');
    expect(screen.getAllByRole('listbox')[0]).toHaveTextContent('Beta');
  });

  it('disables the root interaction surface', () => {
    const onChange = jest.fn();
    const onSelectChange = jest.fn();

    render(
      <CTransfer
        dataSource={TEST_ITEMS}
        disabled
        data-testid="transfer-disabled"
        onChange={onChange}
        onSelectChange={onSelectChange}
      />,
    );

    const transfer = screen.getByTestId('transfer-disabled');

    expect(transfer).toHaveClass('cm-transfer--disabled');
    expect(transfer).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Move all to target' })).toBeDisabled();

    fireEvent.click(getOption('Alpha'));

    expect(getOption('Alpha')).toHaveAttribute('aria-selected', 'false');
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectChange).not.toHaveBeenCalled();
  });

  it('filters both panels locally with default search and renders required structure classes', () => {
    render(
      <CTransfer
        dataSource={TEST_ITEMS}
        defaultTargetKeys={['gamma']}
        showSearch
        data-testid="transfer-search"
      />,
    );

    const transfer = screen.getByTestId('transfer-search');
    const sourceList = screen.getByRole('listbox', { name: 'Source' });
    const targetList = screen.getByRole('listbox', { name: 'Target' });

    expect(transfer.querySelector('.cm-transfer__list')).toBeInTheDocument();
    expect(transfer.querySelector('.cm-transfer__search')).toBeInTheDocument();
    expect(transfer.querySelector('.cm-transfer__body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move selected to target' })).toHaveClass(
      'cm-transfer__button',
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search source items' }), {
      target: { value: 'first' },
    });
    expect(within(sourceList).getByText('Alpha')).toBeInTheDocument();
    expect(within(sourceList).queryByText('Beta')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search target items' }), {
      target: { value: 'missing' },
    });
    expect(within(targetList).getByText('No data')).toBeInTheDocument();
  });

  it('uses custom filterOption and operation labels', () => {
    const filterOption = jest.fn((inputValue: string, item: CTransferItem) => {
      return String(item.key).startsWith(inputValue);
    });

    render(
      <CTransfer
        dataSource={TEST_ITEMS}
        showSearch
        operations={['Add', 'Remove']}
        filterOption={filterOption}
      />,
    );

    expect(screen.getByRole('button', { name: 'Move selected to target' })).toHaveTextContent(
      'Add',
    );
    expect(screen.getByRole('button', { name: 'Move selected to source' })).toHaveTextContent(
      'Remove',
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search source items' }), {
      target: { value: 'g' },
    });

    expect(filterOption).toHaveBeenCalled();
    expect(screen.getByRole('listbox', { name: 'Source' })).toHaveTextContent('Gamma');
    expect(screen.getByRole('listbox', { name: 'Source' })).not.toHaveTextContent('Alpha');
  });
});
