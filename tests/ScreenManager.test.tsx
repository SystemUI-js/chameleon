import React from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CScreen } from '../src/components/Screen/Screen';
import { CScreenManager } from '../src/components/Screen/ScreenManager';

class SubclassScreen extends CScreen {
  public render(): React.ReactElement {
    return <div data-testid="subclass-screen">subclass-screen</div>;
  }
}

class AddedScreen extends CScreen {
  public render(): React.ReactElement {
    return <div data-testid="added-screen">added-screen</div>;
  }
}

class InvalidScreen extends React.Component {
  public render(): React.ReactElement {
    return <div data-testid="invalid-screen">invalid-screen</div>;
  }
}

describe('CScreenManager screen class registration', () => {
  it('registers direct CScreen from children', () => {
    const { container } = render(
      <CScreenManager>
        <CScreen />
      </CScreenManager>,
    );

    const managerRoot = container.firstElementChild as HTMLElement;
    expect(managerRoot.childElementCount).toBe(1);
  });

  it('registers CScreen subclass from children', () => {
    const { getAllByTestId } = render(
      <CScreenManager>
        <SubclassScreen />
      </CScreenManager>,
    );

    expect(getAllByTestId('subclass-screen')).toHaveLength(1);
  });

  it('registers valid constructor through addScreen', () => {
    const managerRef = React.createRef<CScreenManager>();
    const { getAllByTestId } = render(<CScreenManager ref={managerRef}>{null}</CScreenManager>);

    act(() => {
      managerRef.current?.addScreen(AddedScreen);
    });

    expect(getAllByTestId('added-screen')).toHaveLength(1);
  });

  it('rejects invalid constructor through addScreen', () => {
    const managerRef = React.createRef<CScreenManager>();
    const { queryByTestId } = render(<CScreenManager ref={managerRef}>{null}</CScreenManager>);

    act(() => {
      managerRef.current?.addScreen(InvalidScreen as unknown as typeof CScreen);
    });

    expect(queryByTestId('invalid-screen')).not.toBeInTheDocument();
  });

  it('deduplicates constructor between children and addScreen', () => {
    const managerRef = React.createRef<CScreenManager>();
    const { getAllByTestId } = render(
      <CScreenManager ref={managerRef}>
        <SubclassScreen />
      </CScreenManager>,
    );

    act(() => {
      managerRef.current?.addScreen(SubclassScreen);
    });

    expect(getAllByTestId('subclass-screen')).toHaveLength(1);
  });

  it('renders only valid registered screen classes', () => {
    const { queryByTestId } = render(
      <CScreenManager>
        <InvalidScreen />
      </CScreenManager>,
    );

    expect(queryByTestId('invalid-screen')).not.toBeInTheDocument();
  });
});
