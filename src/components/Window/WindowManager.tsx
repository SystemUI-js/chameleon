import React from 'react';
import { View } from 'react-native';
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

  private registerChildren(children: React.ReactNode): void {
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      if (this.isWindowConstructor(child.type)) {
        this.registeredWindowElements.set(child.type, child);
        this.registeredWindowConstructors.add(child.type);
      }
    });
  }

  private isWindowConstructor(candidate: unknown): candidate is WindowConstructor {
    return isManagedConstructor(candidate, CWidget);
  }

  public render(): React.ReactElement {
    return (
      <View>
        {Array.from(this.registeredWindowConstructors).map(
          (WindowCtor) =>
            this.registeredWindowElements.get(WindowCtor) ?? <WindowCtor key={WindowCtor.name} />,
        )}
      </View>
    );
  }
}
