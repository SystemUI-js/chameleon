import { forwardRef, useCallback, useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import { registerMountSlot, unregisterMountSlot } from './mountRegistry';

export interface MountProviderProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
}

export const MountProvider = forwardRef<HTMLDivElement, MountProviderProps>(
  ({ name, className = '', ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      const node = innerRef.current;
      if (!node) return;
      registerMountSlot(name, node);
      return () => unregisterMountSlot(name, node);
    }, [name]);

    const cls = ['cm-mount-provider', className].filter(Boolean).join(' ');

    return <div ref={setRefs} className={cls} {...rest} />;
  },
);

MountProvider.displayName = 'MountProvider';

export default MountProvider;
