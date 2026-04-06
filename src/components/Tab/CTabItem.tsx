import React from 'react';

export interface CTabItemProps {
  title: React.ReactNode;
  children?: React.ReactNode;
}

export function CTabItem({ children }: CTabItemProps): React.ReactElement {
  return <>{children}</>;
}

CTabItem.displayName = 'CTabItem';
