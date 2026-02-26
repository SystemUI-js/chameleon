import React from 'react';
import { CWindow } from './Window';

interface Props {
  children: React.ReactNode;
}

type WindowConstructor = typeof CWindow;

export class CWindowManager extends React.Component<Props> {
  private registeredWindowConstructors = new Set<WindowConstructor>();

  componentDidMount() {
    this.registerChildren(this.props.children);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children) {
      this.registerChildren(this.props.children);
    }
  }

  public addWindow(windowCtor: typeof CWindow): void {
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
        hasNewRegistration = this.registerWindowConstructor(child.type) || hasNewRegistration;
      }
    });

    if (hasNewRegistration) {
      this.forceUpdate();
    }
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
      candidate === CWindow || Object.prototype.isPrototypeOf.call(CWindow.prototype, prototype)
    );
  }

  render() {
    const registeredWindows = Array.from(this.registeredWindowConstructors);

    return (
      <div>
        {registeredWindows.map((WindowCtor) => (
          <WindowCtor key={WindowCtor.name} />
        ))}
      </div>
    );
  }
}
