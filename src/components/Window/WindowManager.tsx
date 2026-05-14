import React from 'react';
import { isManagedConstructor } from '../Manager/isManagedConstructor';
import { CWidget } from '../Widget/Widget';

interface CWindowManagerProps {
  children: React.ReactNode;
}

type WindowConstructor = typeof CWidget;

export class CWindowManager extends React.Component<CWindowManagerProps> {
  private registeredWindowConstructors = new Set<WindowConstructor>();
  private registeredWindowElements = new Map<WindowConstructor, React.ReactElement>();

  public componentDidMount(): void {
    this.registerChildren(this.props.children);
  }

  public componentDidUpdate(prevProps: CWindowManagerProps): void {
    if (prevProps.children !== this.props.children) {
      this.registerChildren(this.props.children);
    }
  }

  public addWindow(windowCtor: typeof CWidget): void {
    if (!this.isWindowConstructor(windowCtor)) {
      return;
    }

    if (this.registerWindowConstructor(windowCtor)) {
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

      if (this.isWindowConstructor(child.type)) {
        hasElementUpdate = this.registerWindowElement(child.type, child) || hasElementUpdate;
        hasNewRegistration = this.registerWindowConstructor(child.type) || hasNewRegistration;
      }
    });

    if (hasNewRegistration || hasElementUpdate) {
      this.forceUpdate();
    }
  }

  private registerWindowElement(
    windowCtor: WindowConstructor,
    element: React.ReactElement,
  ): boolean {
    const previousElement = this.registeredWindowElements.get(windowCtor);
    this.registeredWindowElements.set(windowCtor, element);

    return previousElement !== element;
  }

  private registerWindowConstructor(windowCtor: WindowConstructor): boolean {
    const previousSize = this.registeredWindowConstructors.size;

    this.registeredWindowConstructors.add(windowCtor);

    return this.registeredWindowConstructors.size !== previousSize;
  }

  private isWindowConstructor(candidate: unknown): candidate is WindowConstructor {
    return isManagedConstructor(candidate, CWidget);
  }

  public render(): React.ReactElement {
    const registeredWindows = Array.from(this.registeredWindowConstructors);

    return (
      <div>{registeredWindows.map((WindowCtor) => this.renderRegisteredWindow(WindowCtor))}</div>
    );
  }

  private renderRegisteredWindow(WindowCtor: WindowConstructor): React.ReactElement {
    const element = this.registeredWindowElements.get(WindowCtor);

    if (element) {
      return React.cloneElement(element, {
        key: WindowCtor.name,
      });
    }

    return <WindowCtor key={WindowCtor.name} />;
  }
}
