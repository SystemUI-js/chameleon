import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CListIcon as PackageEntryCListIcon, Theme } from '../src';
import { CListIcon, type CListIconProps } from '../src/components/CListIcon/CListIcon';

describe('CListIcon', () => {
  it('exports CListIcon from package entry', () => {
    render(
      <PackageEntryCListIcon
        visual={<span>visual</span>}
        label="label"
        data-testid="list-icon-package-entry"
      />,
    );

    const listIcon = screen.getByTestId('list-icon-package-entry');

    expect(PackageEntryCListIcon).toBe(CListIcon);
    expect(listIcon).toBeInTheDocument();
    expect(listIcon).toHaveClass('cm-list-icon');
  });

  it('renders a native button with type="button"', () => {
    render(
      <CListIcon visual={<span>visual</span>} label="label" data-testid="list-icon-under-test" />,
    );

    const button = screen.getByTestId('list-icon-under-test');

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('cm-list-icon');
  });

  describe('render surface', () => {
    it('renders visual node into .cm-list-icon__visual', () => {
      render(
        <CListIcon
          visual={<span data-testid="visual-node">★</span>}
          label="Star"
          data-testid="list-icon-visual"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-visual');
      const visualNode = screen.getByTestId('visual-node');

      expect(listIconRoot).toBeInTheDocument();
      expect(listIconRoot).toHaveClass('cm-list-icon');

      expect(visualNode).toBeInTheDocument();
      expect(listIconRoot.querySelector('.cm-list-icon__visual')).toContainElement(visualNode);
    });

    it('renders label into .cm-list-icon__label', () => {
      render(
        <CListIcon visual={<span>icon</span>} label="Item Label" data-testid="list-icon-label" />,
      );

      const listIconRoot = screen.getByTestId('list-icon-label');
      const labelNode = screen.getByText('Item Label');

      expect(listIconRoot).toBeInTheDocument();
      expect(labelNode).toBeInTheDocument();
      expect(listIconRoot.querySelector('.cm-list-icon__label')).toContainElement(labelNode);
    });

    it('renders label as ReactNode', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label={<strong data-testid="label-node">Bold Label</strong>}
          data-testid="list-icon-label-node"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-label-node');
      const labelNode = screen.getByTestId('label-node');

      expect(labelNode).toBeInTheDocument();
      expect(listIconRoot.querySelector('.cm-list-icon__label')).toContainElement(labelNode);
    });

    it('applies active modifier class', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Active Item"
          active
          data-testid="list-icon-active"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-active');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).toHaveClass('cm-list-icon--active');
    });

    it('does not apply active modifier when active is false', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Inactive Item"
          active={false}
          data-testid="list-icon-inactive"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-inactive');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).not.toHaveClass('cm-list-icon--active');
    });

    it('applies disabled modifier class and disabled attribute', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Disabled Item"
          disabled
          data-testid="list-icon-disabled"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-disabled');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).toHaveClass('cm-list-icon--disabled');
      expect(listIconRoot).toBeDisabled();
    });

    it('does not apply disabled modifier when disabled is false', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Enabled Item"
          disabled={false}
          data-testid="list-icon-enabled"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-enabled');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).not.toHaveClass('cm-list-icon--disabled');
      expect(listIconRoot).not.toBeDisabled();
    });

    it('applies draggable modifier class and draggable attribute', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Draggable Item"
          draggable
          data-testid="list-icon-draggable"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-draggable');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).toHaveClass('cm-list-icon--draggable');
      expect(listIconRoot).toHaveAttribute('draggable', 'true');
    });

    it('does not apply draggable modifier when draggable is false', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Non-Draggable Item"
          draggable={false}
          data-testid="list-icon-non-draggable"
        />,
      );

      const listIconRoot = screen.getByTestId('list-icon-non-draggable');

      expect(listIconRoot).toHaveClass('cm-list-icon');
      expect(listIconRoot).not.toHaveClass('cm-list-icon--draggable');
      expect(listIconRoot).not.toHaveAttribute('draggable', 'true');
    });
  });

  describe('interaction callbacks', () => {
    it('forwards onClick and receives the original button event', () => {
      const handleClick = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Clickable"
          onClick={handleClick}
          data-testid="list-icon-click"
        />,
      );

      const button = screen.getByTestId('list-icon-click');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick.mock.calls[0][0].type).toBe('click');
      expect(handleClick.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
    });

    it('forwards onDoubleClick and receives the original button event', () => {
      const handleDoubleClick = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Double-clickable"
          onDoubleClick={handleDoubleClick}
          data-testid="list-icon-dblclick"
        />,
      );

      const button = screen.getByTestId('list-icon-dblclick');
      fireEvent.doubleClick(button);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
      expect(handleDoubleClick.mock.calls[0][0].type).toBe('dblclick');
      expect(handleDoubleClick.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
    });

    it('forwards onContextMenu and receives the original button event', () => {
      const handleContextMenu = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Context-menuable"
          onContextMenu={handleContextMenu}
          data-testid="list-icon-context"
        />,
      );

      const button = screen.getByTestId('list-icon-context');
      fireEvent.contextMenu(button);

      expect(handleContextMenu).toHaveBeenCalledTimes(1);
      expect(handleContextMenu.mock.calls[0][0].type).toBe('contextmenu');
      expect(handleContextMenu.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
    });

    it('forwards onDragStart and receives the original drag event', () => {
      const handleDragStart = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Draggable"
          draggable
          onDragStart={handleDragStart}
          data-testid="list-icon-drag-start"
        />,
      );

      const button = screen.getByTestId('list-icon-drag-start');
      fireEvent.dragStart(button);

      expect(handleDragStart).toHaveBeenCalledTimes(1);
      expect(handleDragStart.mock.calls[0][0].type).toBe('dragstart');
      expect(handleDragStart.mock.calls[0][0].nativeEvent).toBeInstanceOf(Event);
    });

    it('forwards onDrag and receives the original drag event', () => {
      const handleDrag = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Draggable"
          draggable
          onDrag={handleDrag}
          data-testid="list-icon-drag"
        />,
      );

      const button = screen.getByTestId('list-icon-drag');
      fireEvent.drag(button);

      expect(handleDrag).toHaveBeenCalledTimes(1);
      expect(handleDrag.mock.calls[0][0].type).toBe('drag');
      expect(handleDrag.mock.calls[0][0].nativeEvent).toBeInstanceOf(Event);
    });

    it('forwards onDragEnd and receives the original drag event', () => {
      const handleDragEnd = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Draggable"
          draggable
          onDragEnd={handleDragEnd}
          data-testid="list-icon-drag-end"
        />,
      );

      const button = screen.getByTestId('list-icon-drag-end');
      fireEvent.dragEnd(button);

      expect(handleDragEnd).toHaveBeenCalledTimes(1);
      expect(handleDragEnd.mock.calls[0][0].type).toBe('dragend');
      expect(handleDragEnd.mock.calls[0][0].nativeEvent).toBeInstanceOf(Event);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();

      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Disabled"
          disabled
          onClick={handleClick}
          data-testid="list-icon-disabled-click"
        />,
      );

      const button = screen.getByTestId('list-icon-disabled-click');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('theme and className', () => {
    it('applies theme class from explicit theme prop', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Themed"
          theme="cm-theme--win98"
          data-testid="themed-list-icon"
        />,
      );

      const listIcon = screen.getByTestId('themed-list-icon');

      expect(listIcon).toHaveClass('cm-list-icon');
      expect(listIcon).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CListIcon
            visual={<span>icon</span>}
            label="Provider Themed"
            data-testid="provider-themed-list-icon"
          />
        </Theme>,
      );

      const listIcon = screen.getByTestId('provider-themed-list-icon');

      expect(listIcon).toHaveClass('cm-list-icon');
      expect(listIcon).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CListIcon
            visual={<span>icon</span>}
            label="Override"
            theme="cm-theme--winxp"
            data-testid="override-themed-list-icon"
          />
        </Theme>,
      );

      const listIcon = screen.getByTestId('override-themed-list-icon');

      expect(listIcon).toHaveClass('cm-list-icon');
      expect(listIcon).toHaveClass('cm-theme--winxp');
      expect(listIcon).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order: base → theme → className', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Merged"
          className="custom-class"
          theme="cm-theme--win98"
          data-testid="merged-list-icon"
        />,
      );

      const listIcon = screen.getByTestId('merged-list-icon');

      expect(listIcon).toHaveClass('cm-list-icon');
      expect(listIcon).toHaveClass('cm-theme--win98');
      expect(listIcon).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('forwards aria-label to button', () => {
      render(
        <CListIcon
          visual={<span>icon</span>}
          label="Accessible"
          aria-label="List item icon"
          data-testid="aria-list-icon"
        />,
      );

      const button = screen.getByTestId('aria-list-icon');

      expect(button).toHaveAttribute('aria-label', 'List item icon');
    });
  });

  describe('type safety', () => {
    it('does not allow arbitrary HTML attributes as direct props', () => {
      const baseProps: CListIconProps = {
        visual: <span>icon</span>,
        label: 'Label',
      };

      // @ts-expect-error - arbitrary HTML attributes are not part of CListIconProps
      const withArbitrary: CListIconProps = { ...baseProps, href: 'https://example.com' };

      expect(withArbitrary).toBeDefined();
    });
  });
});
