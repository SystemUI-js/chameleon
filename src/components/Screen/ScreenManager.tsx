import React from 'react';
import { isManagedConstructor } from '../Manager/isManagedConstructor';
import { CScreen } from './Screen';

interface CScreenManagerProps {
  children: React.ReactNode;
}

type ScreenConstructor = typeof CScreen;

export class CScreenManager extends React.Component<CScreenManagerProps> {
  private registeredScreenConstructors = new Set<ScreenConstructor>();
  private registeredScreenElements = new Map<ScreenConstructor, React.ReactElement>();

  public componentDidMount(): void {
    this.registerChildren(this.props.children);
  }

  public componentDidUpdate(prevProps: CScreenManagerProps): void {
    if (prevProps.children !== this.props.children) {
      this.registerChildren(this.props.children);
    }
  }

  public addScreen(screenCtor: typeof CScreen): void {
    if (!this.isScreenConstructor(screenCtor)) {
      return;
    }

    if (this.registerScreenConstructor(screenCtor)) {
      this.forceUpdate();
    }
  }

  private registerChildren(children: React.ReactNode): void {
    let hasNewRegistration = false;
    let hasElementUpdate = false;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }

      if (this.isScreenConstructor(child.type)) {
        hasElementUpdate = this.registerScreenElement(child.type, child) || hasElementUpdate;
        hasNewRegistration = this.registerScreenConstructor(child.type) || hasNewRegistration;
      }
    });

    if (hasNewRegistration || hasElementUpdate) {
      this.forceUpdate();
    }
  }

  private registerScreenElement(
    screenCtor: ScreenConstructor,
    element: React.ReactElement,
  ): boolean {
    const previousElement = this.registeredScreenElements.get(screenCtor);
    this.registeredScreenElements.set(screenCtor, element);

    return previousElement !== element;
  }

  private registerScreenConstructor(screenCtor: ScreenConstructor): boolean {
    const previousSize = this.registeredScreenConstructors.size;
    this.registeredScreenConstructors.add(screenCtor);

    return this.registeredScreenConstructors.size !== previousSize;
  }

  private isScreenConstructor(candidate: unknown): candidate is ScreenConstructor {
    return isManagedConstructor(candidate, CScreen);
  }

  public render(): React.ReactElement {
    const registeredScreens = Array.from(this.registeredScreenConstructors);

    return (
      <div>{registeredScreens.map((ScreenCtor) => this.renderRegisteredScreen(ScreenCtor))}</div>
    );
  }

  private renderRegisteredScreen(ScreenCtor: ScreenConstructor): React.ReactElement {
    const element = this.registeredScreenElements.get(ScreenCtor);

    if (element) {
      return React.cloneElement(element, {
        key: ScreenCtor.name,
      });
    }

    return <ScreenCtor key={ScreenCtor.name} />;
  }
}
