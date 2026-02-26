import React from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
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
      managerRef.current?.addWindow(InvalidWindow as unknown as typeof CWindow);
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
});
