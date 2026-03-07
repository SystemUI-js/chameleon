import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CWidget } from '../src/components/Widget/Widget';
import { CWindow } from '../src/components/Window/Window';
import { CWindowManager } from '../src/components/Window/WindowManager';

class SubclassWindow extends CWindow {
  render() {
    return <div data-testid="subclass-window">subclass-window</div>;
  }
}

class AddedWindow extends CWindow {
  render() {
    return <div data-testid="added-window">added-window</div>;
  }
}

class InvalidWindow extends React.Component {
  render() {
    return <div data-testid="invalid-window">invalid-window</div>;
  }
}

describe('CWindowManager window class registration', () => {
  it('registers direct CWindow from children', () => {
    const { container } = render(
      <CWindowManager>
        <CWindow />
      </CWindowManager>,
    );

    const managerRoot = container.firstElementChild as HTMLElement;

    expect(managerRoot.childElementCount).toBe(1);
  });

  it('registers CWindow subclass from children', () => {
    const { getAllByTestId } = render(
      <CWindowManager>
        <SubclassWindow />
      </CWindowManager>,
    );

    expect(getAllByTestId('subclass-window')).toHaveLength(1);
  });

  it('registers valid constructor through addWindow', () => {
    const managerRef = React.createRef<CWindowManager>();
    const { getAllByTestId } = render(<CWindowManager ref={managerRef}>{null}</CWindowManager>);

    act(() => {
      managerRef.current?.addWindow(AddedWindow);
    });

    expect(getAllByTestId('added-window')).toHaveLength(1);
  });

  it('rejects invalid constructor through addWindow', () => {
    const managerRef = React.createRef<CWindowManager>();
    const { queryByTestId } = render(<CWindowManager ref={managerRef}>{null}</CWindowManager>);

    act(() => {
      managerRef.current?.addWindow(InvalidWindow as unknown as typeof CWidget);
    });

    expect(queryByTestId('invalid-window')).not.toBeInTheDocument();
  });

  it('deduplicates constructor between children and addWindow', () => {
    const managerRef = React.createRef<CWindowManager>();
    const { getAllByTestId } = render(
      <CWindowManager ref={managerRef}>
        <SubclassWindow />
      </CWindowManager>,
    );

    act(() => {
      managerRef.current?.addWindow(SubclassWindow);
    });

    expect(getAllByTestId('subclass-window')).toHaveLength(1);
  });

  it('renders only valid registered window classes', () => {
    const { queryByTestId } = render(
      <CWindowManager>
        <InvalidWindow />
      </CWindowManager>,
    );

    expect(queryByTestId('invalid-window')).not.toBeInTheDocument();
  });

  it('accepts direct CWidget constructor through addWindow', () => {
    const managerRef = React.createRef<CWindowManager>();
    const { getAllByTestId } = render(<CWindowManager ref={managerRef}>{null}</CWindowManager>);

    act(() => {
      managerRef.current?.addWindow(CWidget);
    });

    expect(getAllByTestId('widget-frame')).toHaveLength(1);
  });

  it('updates cached window element when same constructor receives new props', async () => {
    const { getByTestId, rerender } = render(
      <CWindowManager>
        <CWindow x={12}>
          <div data-testid="window-body">version-a</div>
        </CWindow>
      </CWindowManager>,
    );

    expect(getByTestId('window-frame')).toHaveStyle({ left: '12px' });
    expect(getByTestId('window-body')).toHaveTextContent('version-a');

    rerender(
      <CWindowManager>
        <CWindow x={56}>
          <div data-testid="window-body">version-b</div>
        </CWindow>
      </CWindowManager>,
    );

    await waitFor(() => {
      expect(getByTestId('window-frame')).toHaveStyle({ left: '56px' });
      expect(getByTestId('window-body')).toHaveTextContent('version-b');
    });
  });
});
