import React from 'react';
import { createReactNativeMultiDrag } from './createReactNativeMultiDrag';
import type {
  ReactNativeMultiDragControllerOptions,
  ReactNativeMultiDragMetadata,
  ReactNativeMultiDragState,
  UseReactNativeMultiDragResult,
} from '../types';

export function useReactNativeMultiDrag<TMetadata = ReactNativeMultiDragMetadata>(
  options: ReactNativeMultiDragControllerOptions<TMetadata> = {},
): UseReactNativeMultiDragResult<TMetadata> {
  const facadeRef = React.useRef<ReturnType<typeof createReactNativeMultiDrag<TMetadata>> | null>(
    null,
  );

  if (!facadeRef.current) {
    facadeRef.current = createReactNativeMultiDrag(options);
  }

  const [state, setState] = React.useState<ReactNativeMultiDragState<TMetadata>>(
    facadeRef.current.getState(),
  );

  React.useEffect(() => facadeRef.current?.subscribe(setState), []);

  return {
    ...facadeRef.current,
    state,
  };
}
