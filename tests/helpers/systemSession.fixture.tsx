import type { ReactNode } from 'react';

export interface PersistentSystemStoreState {
  readonly className?: string;
  readonly screenClassName?: string;
  readonly systemType: string;
  readonly theme: string;
}

export interface RuntimeWindowFrameState {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface RuntimeWindowSessionState {
  readonly title: string;
  readonly body: ReactNode;
  readonly frame: RuntimeWindowFrameState;
}

export interface SystemSessionFixture {
  readonly persistentStoreState: PersistentSystemStoreState;
  readonly runtimeWindowSessionState: RuntimeWindowSessionState;
}

export interface CreateSystemSessionFixtureOptions {
  readonly persistentStoreState?: Partial<PersistentSystemStoreState>;
  readonly runtimeWindowSessionState?: Partial<Omit<RuntimeWindowSessionState, 'frame'>> & {
    readonly frame?: Partial<RuntimeWindowFrameState>;
  };
}

export const createSystemSessionFixture = (
  overrides?: CreateSystemSessionFixtureOptions,
): SystemSessionFixture => {
  const defaultPersistentStoreState: PersistentSystemStoreState = {
    className: 'cm-system--windows cm-theme--default',
    screenClassName: 'cm-screen-grid',
    systemType: 'windows',
    theme: 'default',
  };

  const defaultRuntimeWindowSessionState: RuntimeWindowSessionState = {
    title: 'Session Window',
    body: <div data-testid="session-window-body">Session body</div>,
    frame: {
      x: 32,
      y: 28,
      width: 332,
      height: 228,
    },
  };

  return {
    persistentStoreState: {
      ...defaultPersistentStoreState,
      ...overrides?.persistentStoreState,
    },
    runtimeWindowSessionState: {
      ...defaultRuntimeWindowSessionState,
      ...overrides?.runtimeWindowSessionState,
      frame: {
        ...defaultRuntimeWindowSessionState.frame,
        ...overrides?.runtimeWindowSessionState?.frame,
      },
    },
  };
};
