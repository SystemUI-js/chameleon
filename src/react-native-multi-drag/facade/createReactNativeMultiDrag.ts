import { createReactNativeMultiDragNativeAdapter } from '../adapters/nativeAdapter';
import { createReactNativeMultiDragController } from '../core/controller';
import type {
  ReactNativeMultiDragControllerOptions,
  ReactNativeMultiDragFacade,
  ReactNativeMultiDragMetadata,
} from '../types';

export function createReactNativeMultiDrag<TMetadata = ReactNativeMultiDragMetadata>(
  options: ReactNativeMultiDragControllerOptions<TMetadata> = {},
): ReactNativeMultiDragFacade<TMetadata> {
  const controller = createReactNativeMultiDragController(options);
  const adapter = createReactNativeMultiDragNativeAdapter(controller);

  return {
    controller,
    adapter,
    getState: () => controller.getState(),
    subscribe: (listener) => controller.subscribe(listener),
  };
}
