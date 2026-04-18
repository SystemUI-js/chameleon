import React from 'react';

export type WebTextProps = React.HTMLAttributes<HTMLSpanElement>;

export const WebText = React.forwardRef<HTMLSpanElement, WebTextProps>(
  function WebText(props, ref) {
    return <span ref={ref} {...props} />;
  },
);
