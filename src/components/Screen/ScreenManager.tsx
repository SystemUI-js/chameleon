import React from 'react';

interface Props {
  children: React.ReactNode;
}

export class CScreenManager extends React.Component<Props> {
  render() {
    return <div>{this.props.children}</div>;
  }
}
