import type { ReactNode } from 'react';
import { CIconContainer } from '@/components/Icon/IconContainer';
import { CWindow } from '@/components/Window/Window';
import {
  CWindowTitle,
  type WindowTitleActionButtonPosition,
} from '@/components/Window/WindowTitle';
import { WidgetInteractionBehavior } from '@/components/Widget/Widget';
import { Pressable, Text, View } from '../../runtime/react-native-web';
import { DevThemeRoot } from '../themeSwitcher';
import '../styles/catalog.scss';
import { readHarnessRoute } from './harnessRoute';

const handleWindowActionClick = (): void => {};

const renderWindowActionButtons = (): React.JSX.Element => {
  return (
    <View className="cm-catalog__window-actions">
      <Pressable
        className="cm-catalog__window-action"
        data-testid="window-demo-minimize"
        aria-label="Minimize window"
        onPress={handleWindowActionClick}
      >
        —
      </Pressable>
      <Pressable
        className="cm-catalog__window-action"
        data-testid="window-demo-maximize"
        aria-label="Maximize window"
        onPress={handleWindowActionClick}
      >
        □
      </Pressable>
      <Pressable
        className="cm-catalog__window-action cm-catalog__window-action--close"
        data-testid="window-demo-close"
        aria-label="Close window"
        onPress={handleWindowActionClick}
      >
        ×
      </Pressable>
    </View>
  );
};

const renderActionButtonFixture = (
  title: string,
  actionButtonPosition?: WindowTitleActionButtonPosition,
): ReactNode => {
  return (
    <CWindow x={10} y={20} width={240} height={160}>
      <CWindowTitle
        actionButton={renderWindowActionButtons()}
        actionButtonPosition={actionButtonPosition}
      >
        {title}
      </CWindowTitle>
      <View>Window action controls</View>
    </CWindow>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'default':
      return (
        <CWindow x={10} y={20} width={240} height={160}>
          <CWindowTitle>Default Window</CWindowTitle>
          <View>Default content</View>
        </CWindow>
      );
    case 'drag-only':
      return (
        <CWindow
          x={12}
          y={24}
          width={200}
          height={120}
          resizable={false}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Drag only</CWindowTitle>
        </CWindow>
      );
    case 'min-clamp':
      return (
        <CWindow
          x={30}
          y={30}
          width={40}
          height={30}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Clamp min</CWindowTitle>
        </CWindow>
      );
    case 'max-clamp':
      return (
        <CWindow
          x={50}
          y={60}
          width={120}
          height={100}
          resizeOptions={{
            minContentWidth: 20,
            minContentHeight: 30,
            maxContentWidth: 150,
            maxContentHeight: 110,
          }}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Clamp max</CWindowTitle>
        </CWindow>
      );
    case 'outline-move':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          moveBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Move</CWindowTitle>
          <View>Outline move content</View>
        </CWindow>
      );
    case 'outline-resize':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Resize</CWindowTitle>
          <View>Outline resize content</View>
        </CWindow>
      );
    case 'outline-both':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          moveBehavior={WidgetInteractionBehavior.Outline}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Both</CWindowTitle>
          <View>Outline move + resize content</View>
        </CWindow>
      );
    case 'icon-container':
      return (
        <View style={{ padding: 24 }}>
          <CIconContainer
            iconList={[
              {
                icon: <Text>First</Text>,
                title: 'First',
                position: { x: 10, y: 20 },
              },
              {
                icon: <Text>Second</Text>,
                title: 'Second',
                position: { x: 100, y: 120 },
              },
            ]}
            data-testid="icon-container"
          />
        </View>
      );
    case 'action-buttons-right':
      return renderActionButtonFixture('Action buttons right');
    case 'action-buttons-left':
      return renderActionButtonFixture('Action buttons left', 'left');
    default:
      return <View data-testid="fixture-error">Unknown fixture: {fixture}</View>;
  }
};

export const WindowHarnessApp = (): React.JSX.Element => {
  const route = readHarnessRoute();

  return <DevThemeRoot theme={route.theme}>{renderFixture(route.fixture)}</DevThemeRoot>;
};
