import React from 'react';

export type WebViewProps = React.HTMLAttributes<HTMLDivElement>;

export const WebView = React.forwardRef<HTMLDivElement, WebViewProps>(function WebView(props, ref) {
  return <div ref={ref} {...props} />;
});
