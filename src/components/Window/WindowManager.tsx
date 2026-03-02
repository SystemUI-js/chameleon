import React from 'react';
import { CWidget } from '../Widget/Widget';

interface Props {
  children: React.ReactNode;
}

type WindowConstructor = typeof CWidget;

export class CWindowManager extends React.Component<Props> {
  private registeredWindowConstructors = new Set<WindowConstructor>();
  private registeredWindowElements = new Map<WindowConstructor, React.ReactElement>();

  componentDidMount() {
    this.registerChildren(this.props.children);
  }

  componentDidUpdate(prevProps: Props) {
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

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }

      if (this.isWindowConstructor(child.type)) {
        this.registerWindowElement(child.type, child);
        hasNewRegistration = this.registerWindowConstructor(child.type) || hasNewRegistration;
      }
    });

    if (hasNewRegistration) {
      this.forceUpdate();
    }
  }

  private registerWindowElement(windowCtor: WindowConstructor, element: React.ReactElement): void {
    this.registeredWindowElements.set(windowCtor, element);
  }

  private registerWindowConstructor(windowCtor: WindowConstructor): boolean {
    const previousSize = this.registeredWindowConstructors.size;

    this.registeredWindowConstructors.add(windowCtor);

    return this.registeredWindowConstructors.size !== previousSize;
  }

  private isWindowConstructor(candidate: unknown): candidate is WindowConstructor {
    if (typeof candidate !== 'function') {
      return false;
    }

    const constructorWithPrototype = candidate as { prototype?: unknown };
    const { prototype } = constructorWithPrototype;

    if (!prototype || typeof prototype !== 'object') {
      return false;
    }

    return (
      candidate === CWidget || Object.prototype.isPrototypeOf.call(CWidget.prototype, prototype)
    );
  }

  render() {
    const registeredWindows = Array.from(this.registeredWindowConstructors);

    // Given registered window constructors, when rendering, then instantiate each constructor once.
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
