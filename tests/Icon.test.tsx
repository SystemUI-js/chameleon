import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { CIcon as PackageEntryCIcon, Theme } from '../src';
import { CIcon } from '../src/components/Icon/Icon';

describe('CIcon', () => {
  it('exports CIcon from package entry', () => {
    render(<PackageEntryCIcon icon={<span>icon</span>} data-testid="icon-package-entry" />);

    const icon = screen.getByTestId('icon-package-entry');

    expect(PackageEntryCIcon).toBe(CIcon);
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('cm-icon');
  });

  describe('render surface', () => {
    it('renders icon node title and active modifier', () => {
      render(
        <CIcon
          icon={<span data-testid="icon-node">★</span>}
          title="Star icon"
          active
          data-testid="icon-under-test"
        />,
      );

      const iconRoot = screen.getByTestId('icon-under-test');
      const iconNode = screen.getByTestId('icon-node');
      const titleNode = screen.getByText('Star icon');

      expect(iconRoot).toBeInTheDocument();
      expect(iconRoot).toHaveClass('cm-icon');
      expect(iconRoot).toHaveClass('cm-icon--active');

      expect(iconNode).toBeInTheDocument();
      expect(iconRoot.querySelector('.cm-icon__content')).toContainElement(iconNode);

      expect(titleNode).toBeInTheDocument();
      expect(iconRoot.querySelector('.cm-icon__title')).toContainElement(titleNode);
    });

    it('renders without active modifier when active is false', () => {
      render(<CIcon icon={<span>icon</span>} data-testid="icon-inactive" />);

      const iconRoot = screen.getByTestId('icon-inactive');

      expect(iconRoot).toHaveClass('cm-icon');
      expect(iconRoot).not.toHaveClass('cm-icon--active');
    });

    it('renders title as separate stable DOM region', () => {
      render(<CIcon icon={<span>icon</span>} title="Icon Title" data-testid="icon-with-title" />);

      const iconRoot = screen.getByTestId('icon-with-title');
      const titleElement = iconRoot.querySelector('.cm-icon__title');

      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('Icon Title');
    });

    it('does not render title region when title is undefined', () => {
      render(<CIcon icon={<span>icon</span>} data-testid="icon-no-title" />);

      const iconRoot = screen.getByTestId('icon-no-title');

      expect(iconRoot.querySelector('.cm-icon__title')).toBeNull();
    });
  });

  describe('theme and className', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CIcon icon={<span>icon</span>} theme="cm-theme--win98" data-testid="themed-icon" />);

      const icon = screen.getByTestId('themed-icon');

      expect(icon).toHaveClass('cm-icon');
      expect(icon).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CIcon icon={<span>icon</span>} data-testid="provider-themed-icon" />
        </Theme>,
      );

      const icon = screen.getByTestId('provider-themed-icon');

      expect(icon).toHaveClass('cm-icon');
      expect(icon).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CIcon
            icon={<span>icon</span>}
            theme="cm-theme--winxp"
            data-testid="override-themed-icon"
          />
        </Theme>,
      );

      const icon = screen.getByTestId('override-themed-icon');

      expect(icon).toHaveClass('cm-icon');
      expect(icon).toHaveClass('cm-theme--winxp');
      expect(icon).not.toHaveClass('cm-theme--win98');
    });

    it('merges theme class and maps position style', () => {
      const { rerender } = render(
        <CIcon
          icon={<span>icon</span>}
          theme="cm-theme--win98"
          position={{ x: 100, y: 200 }}
          data-testid="positioned-icon"
        />,
      );

      const icon = screen.getByTestId('positioned-icon');

      expect(icon).toHaveClass('cm-icon');
      expect(icon).toHaveClass('cm-theme--win98');
      expect(icon).toHaveStyle({ left: '100px', top: '200px' });

      rerender(
        <CIcon icon={<span>icon</span>} className="custom-class" data-testid="positioned-icon" />,
      );

      const iconNoPosition = screen.getByTestId('positioned-icon');
      expect(iconNoPosition).toHaveClass('cm-icon');
      expect(iconNoPosition).toHaveClass('custom-class');
      expect(iconNoPosition.style.left).toBe('');
      expect(iconNoPosition.style.top).toBe('');
    });

    it('merges className with theme following correct order: base → theme → className', () => {
      render(
        <CIcon
          icon={<span>icon</span>}
          className="custom-class"
          theme="cm-theme--win98"
          data-testid="merged-icon"
        />,
      );

      const icon = screen.getByTestId('merged-icon');

      expect(icon).toHaveClass('cm-icon');
      expect(icon).toHaveClass('cm-theme--win98');
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('position styling', () => {
    it('applies left and top styles when position is provided', () => {
      render(
        <CIcon
          icon={<span>icon</span>}
          position={{ x: 50, y: 75 }}
          data-testid="positioned-icon"
        />,
      );

      const icon = screen.getByTestId('positioned-icon');

      expect(icon).toHaveStyle({ left: '50px', top: '75px' });
    });

    it('does not force inline positioning when position is omitted', () => {
      render(<CIcon icon={<span>icon</span>} data-testid="normal-icon" />);

      const icon = screen.getByTestId('normal-icon');

      expect(icon.style.left).toBe('');
      expect(icon.style.top).toBe('');
    });

    it('updates style when position changes', () => {
      const { rerender } = render(
        <CIcon
          icon={<span>icon</span>}
          position={{ x: 10, y: 20 }}
          data-testid="dynamic-position"
        />,
      );

      const icon = screen.getByTestId('dynamic-position');
      expect(icon).toHaveStyle({ left: '10px', top: '20px' });

      rerender(
        <CIcon
          icon={<span>icon</span>}
          position={{ x: 30, y: 40 }}
          data-testid="dynamic-position"
        />,
      );

      expect(icon).toHaveStyle({ left: '30px', top: '40px' });
    });
  });

  describe('interaction semantics', () => {
    it('single click opens when open trigger is click', () => {
      const handleActive = jest.fn();
      const handleOpen = jest.fn();

      render(
        <CIcon
          icon={<span>icon</span>}
          activeTrigger="click"
          openTrigger="click"
          onActive={handleActive}
          onOpen={handleOpen}
          data-testid="icon-click-open"
        />,
      );

      fireEvent.click(screen.getByTestId('icon-click-open'));

      expect(handleActive).toHaveBeenCalledTimes(1);
      expect(handleActive).toHaveBeenCalledWith(true);
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it('single click only activates when open trigger is doubleClick', () => {
      const handleActive = jest.fn();
      const handleOpen = jest.fn();

      render(
        <CIcon
          icon={<span>icon</span>}
          activeTrigger="click"
          openTrigger="doubleClick"
          onActive={handleActive}
          onOpen={handleOpen}
          data-testid="icon-double-click-open"
        />,
      );

      const icon = screen.getByTestId('icon-double-click-open');

      fireEvent.click(icon);

      expect(handleActive).toHaveBeenCalledTimes(1);
      expect(handleActive).toHaveBeenCalledWith(true);
      expect(handleOpen).not.toHaveBeenCalled();

      fireEvent.dblClick(icon);

      expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it('hover and context menu follow configured trigger semantics', () => {
      const hoverActive = jest.fn();
      const hoverOpen = jest.fn();
      const contextOrder: string[] = [];
      let contextMenuEvent: React.MouseEvent | undefined;
      const contextActive = jest.fn(() => {
        contextOrder.push('active');
      });
      const contextMenu = jest.fn((event: React.MouseEvent) => {
        contextMenuEvent = event;
        contextOrder.push('contextmenu');
      });

      render(
        <>
          <CIcon
            icon={<span>hover</span>}
            activeTrigger="hover"
            openTrigger="doubleClick"
            onActive={hoverActive}
            onOpen={hoverOpen}
            data-testid="icon-hover-trigger"
          />
          <CIcon
            icon={<span>context</span>}
            onActive={contextActive}
            onContextMenu={contextMenu}
            data-testid="icon-context-trigger"
          />
        </>,
      );

      const hoverIcon = screen.getByTestId('icon-hover-trigger');
      const contextIcon = screen.getByTestId('icon-context-trigger');

      fireEvent.click(hoverIcon);
      expect(hoverActive).not.toHaveBeenCalled();
      expect(hoverOpen).not.toHaveBeenCalled();

      fireEvent.mouseEnter(hoverIcon);
      expect(hoverActive).toHaveBeenCalledTimes(1);
      expect(hoverActive).toHaveBeenCalledWith(true);

      fireEvent.mouseLeave(hoverIcon);
      expect(hoverActive).toHaveBeenCalledTimes(1);

      fireEvent.contextMenu(contextIcon);

      expect(contextActive).toHaveBeenCalledTimes(1);
      expect(contextActive).toHaveBeenCalledWith(true);
      expect(contextMenu).toHaveBeenCalledTimes(1);
      expect(contextMenuEvent?.type).toBe('contextmenu');
      expect(contextMenuEvent?.nativeEvent).toBeInstanceOf(MouseEvent);
      expect(contextOrder).toEqual(['active', 'contextmenu']);
    });
  });
});
