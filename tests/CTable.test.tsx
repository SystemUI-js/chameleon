import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { CTableColumn } from '../src';
import { CTable as PackageEntryCTable, Theme } from '../src';
import { CTable } from '../src/components/Table/CTable';

type TestRecord = {
  readonly id: string;
  readonly name: string;
  readonly age: number;
};

const TEST_ROWS: readonly TestRecord[] = [
  { id: 'row-1', name: 'Ada', age: 36 },
  { id: 'row-2', name: 'Grace', age: 40 },
  { id: 'row-3', name: 'Linus', age: 55 },
];

const TEST_COLUMNS: readonly CTableColumn<TestRecord>[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', render: (value) => <strong>{value}</strong> },
];

const getRenderedNames = (): string[] => {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '');
};

describe('CTable', () => {
  it('exports CTable from package entry matching the direct component import', () => {
    render(
      <PackageEntryCTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        data-testid="table-package-entry"
      />,
    );

    expect(PackageEntryCTable).toBe(CTable);
    expect(screen.getByTestId('table-package-entry')).toHaveClass('cm-table');
  });

  it('renders a semantic table with ARIA roles', () => {
    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        aria-label="People"
        data-testid="table-semantic"
      />,
    );

    const table = screen.getByRole('table', { name: 'People' });

    expect(table.querySelector('thead')).toBeInTheDocument();
    expect(table.querySelector('tbody')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('cell')).toHaveLength(6);
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
  });

  it('renders required structural classes', () => {
    render(<CTable dataSource={TEST_ROWS} columns={TEST_COLUMNS} rowKey="id" />);

    const table = screen.getByRole('table');

    expect(table.querySelector('.cm-table__header')).toBeInTheDocument();
    expect(table.querySelector('.cm-table__body')).toBeInTheDocument();
  });

  it('applies column align, width, and className to header and body cells', () => {
    const columns: readonly CTableColumn<TestRecord>[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        align: 'center',
        width: 160,
        className: 'name-column',
      },
      { title: 'Age', dataIndex: 'age', align: 'right', width: '8rem', className: 'age-column' },
    ];

    render(<CTable dataSource={TEST_ROWS} columns={columns} rowKey="id" />);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    const ageHeader = screen.getByRole('columnheader', { name: 'Age' });
    const firstRowCells = within(screen.getAllByRole('row')[1]).getAllByRole('cell');

    expect(nameHeader).toHaveClass('cm-table__cell--align-center', 'name-column');
    expect(nameHeader).toHaveAttribute('width', '160');
    expect(ageHeader).toHaveClass('cm-table__cell--align-right', 'age-column');
    expect(ageHeader).toHaveAttribute('width', '8rem');
    expect(firstRowCells[0]).toHaveClass('cm-table__cell--align-center', 'name-column');
    expect(firstRowCells[1]).toHaveClass('cm-table__cell--align-right', 'age-column');
  });

  it('merges base, theme, and custom className on the root', () => {
    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        theme="win98"
        className="custom-table"
        data-testid="table-themed"
      />,
    );

    expect(screen.getByTestId('table-themed')).toHaveClass(
      'cm-table',
      'cm-theme--win98',
      'custom-table',
    );
  });

  it('uses Theme provider when no explicit theme prop is supplied', () => {
    render(
      <Theme name="winxp">
        <CTable
          dataSource={TEST_ROWS}
          columns={TEST_COLUMNS}
          rowKey="id"
          data-testid="table-provider-theme"
        />
      </Theme>,
    );

    expect(screen.getByTestId('table-provider-theme')).toHaveClass('cm-table', 'cm-theme--winxp');
  });

  it('paginates data when pagination is enabled as boolean', () => {
    const manyRows = Array.from(
      { length: 11 },
      (_, index): TestRecord => ({
        id: `row-${index + 1}`,
        name: `Person ${index + 1}`,
        age: 20 + index,
      }),
    );

    render(
      <CTable
        dataSource={manyRows}
        columns={TEST_COLUMNS}
        rowKey="id"
        pagination
        data-testid="table-paged"
      />,
    );

    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.queryByText('Person 11')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
    expect(screen.getByText('Person 11')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });

  it('uses pagination config and emits page changes', () => {
    const handleChange = jest.fn();

    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        pagination={{ current: 1, pageSize: 1, total: 3, onChange: handleChange }}
      />,
    );

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(handleChange).toHaveBeenCalledWith(2, 1);
  });

  it('sorts sortable columns and cycles through ascending, descending, and unsorted', () => {
    const handleChange = jest.fn();
    const rows: readonly TestRecord[] = [
      { id: 'row-1', name: 'Grace', age: 40 },
      { id: 'row-2', name: 'Linus', age: 55 },
      { id: 'row-3', name: 'Ada', age: 36 },
    ];
    const columns: readonly CTableColumn<TestRecord>[] = [
      { title: 'Name', dataIndex: 'name', sorter: true },
      { title: 'Age', dataIndex: 'age' },
    ];

    render(<CTable dataSource={rows} columns={columns} rowKey="id" onChange={handleChange} />);

    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    const nameSortButton = within(nameHeader).getByRole('button', { name: /Name/ });

    expect(nameSortButton).toHaveClass('cm-table__sorter');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(getRenderedNames()).toEqual(['Grace', 'Linus', 'Ada']);

    fireEvent.click(nameSortButton);

    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(getRenderedNames()).toEqual(['Ada', 'Grace', 'Linus']);
    expect(handleChange).toHaveBeenLastCalledWith({
      column: columns[0],
      columnKey: 'name',
      field: 'name',
      order: 'ascend',
    });

    fireEvent.click(nameSortButton);

    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    expect(getRenderedNames()).toEqual(['Linus', 'Grace', 'Ada']);
    expect(handleChange).toHaveBeenLastCalledWith({
      column: columns[0],
      columnKey: 'name',
      field: 'name',
      order: 'descend',
    });

    fireEvent.click(nameSortButton);

    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(getRenderedNames()).toEqual(['Grace', 'Linus', 'Ada']);
    expect(handleChange).toHaveBeenLastCalledWith({
      column: null,
      columnKey: null,
      field: null,
      order: null,
    });
  });

  it('uses a custom sorter function when provided', () => {
    const rows: readonly TestRecord[] = [
      { id: 'row-1', name: 'Edsger', age: 72 },
      { id: 'row-2', name: 'Ada', age: 36 },
      { id: 'row-3', name: 'Grace', age: 40 },
    ];
    const columns: readonly CTableColumn<TestRecord>[] = [
      { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.length - b.name.length },
      { title: 'Age', dataIndex: 'age' },
    ];

    render(<CTable dataSource={rows} columns={columns} rowKey="id" />);

    fireEvent.click(screen.getByRole('button', { name: /Name/ }));

    expect(getRenderedNames()).toEqual(['Ada', 'Grace', 'Edsger']);
  });

  it('shows a loading indicator overlay while retaining table content', () => {
    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        loading
        data-testid="table-loading"
      />,
    );

    const root = screen.getByTestId('table-loading');

    expect(root).toHaveClass('cm-table--loading');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(within(root).getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('renders emptyText and empty class when there are no rows', () => {
    render(
      <CTable
        dataSource={[]}
        columns={TEST_COLUMNS}
        rowKey="id"
        emptyText="Nothing here"
        data-testid="table-empty"
      />,
    );

    expect(screen.getByTestId('table-empty')).toHaveClass('cm-table--empty');
    expect(screen.getByText('Nothing here')).toHaveClass('cm-table__cell--empty');
  });

  it('supports uncontrolled row selection and skips disabled row checkboxes', () => {
    const handleSelectionChange = jest.fn();

    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        rowSelection={{
          defaultSelectedRowKeys: ['row-1'],
          getCheckboxProps: (record) => ({ disabled: record.id === 'row-2' }),
          onChange: handleSelectionChange,
        }}
      />,
    );

    const adaCheckbox = screen.getByRole('checkbox', { name: 'Select row 1' });
    const graceCheckbox = screen.getByRole('checkbox', { name: 'Select row 2' });
    const linusCheckbox = screen.getByRole('checkbox', { name: 'Select row 3' });

    expect(screen.getAllByRole('columnheader')[0]).toHaveClass('cm-table__selection');
    expect(adaCheckbox.closest('td')).toHaveClass('cm-table__selection');
    expect(adaCheckbox).toBeChecked();
    expect(graceCheckbox).toBeDisabled();

    fireEvent.click(linusCheckbox);

    expect(linusCheckbox).toBeChecked();
    expect(handleSelectionChange).toHaveBeenLastCalledWith(
      ['row-1', 'row-3'],
      [TEST_ROWS[0], TEST_ROWS[2]],
    );
  });

  it('reports controlled row selection changes without mutating checked state', () => {
    const handleSelectionChange = jest.fn();

    render(
      <CTable
        dataSource={TEST_ROWS}
        columns={TEST_COLUMNS}
        rowKey="id"
        rowSelection={{ selectedRowKeys: ['row-1'], onChange: handleSelectionChange }}
      />,
    );

    const adaCheckbox = screen.getByRole('checkbox', { name: 'Select row 1' });
    const graceCheckbox = screen.getByRole('checkbox', { name: 'Select row 2' });

    fireEvent.click(graceCheckbox);

    expect(adaCheckbox).toBeChecked();
    expect(graceCheckbox).not.toBeChecked();
    expect(handleSelectionChange).toHaveBeenCalledWith(
      ['row-1', 'row-2'],
      [TEST_ROWS[0], TEST_ROWS[1]],
    );
  });
});
