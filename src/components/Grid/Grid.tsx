import React from 'react';
import './index.scss';

interface Props {
  grid: [number, number];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  initGridSize?: {
    rows: string[];
    columns: string[];
  };
  onSizeChange?: (rows: string[], columns: string[]) => void;
}

interface State {
  rowSizes: string[];
  columnSizes: string[];
}

export class CGrid extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rowSizes: this.props.initGridSize?.rows || [],
      columnSizes: this.props.initGridSize?.columns || [],
    };
  }

  render() {
    const children = this.props.children
      ? React.Children.toArray(this.props.children).filter((child): child is React.ReactElement =>
          React.isValidElement(child),
        )
      : null;

    return (
      <div
        className={this.props.className || 'c-grid'}
        style={{
          ...this.props.style,
          gridTemplateRows: this.state.rowSizes.join(' '),
          gridTemplateColumns: this.state.columnSizes.join(' '),
        }}
      >
        {children}
      </div>
    );
  }

  setGridSize(rows: string[], columns: string[]) {
    this.setState({
      rowSizes: rows,
      columnSizes: columns,
    });
    if (this.props.onSizeChange) {
      this.props.onSizeChange(rows, columns);
    }
  }
}

interface GridItemProps {
  parentGrid: Props['grid'];
  grid: [number, number, number, number];
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  setGridSize?: (rows: string[], columns: string[]) => void;
}

export class CGridItem extends React.Component<GridItemProps> {
  render() {
    return (
      <div
        className={this.props.className || 'c-grid-item'}
        style={{
          ...this.props.style,
          gridRowStart: this.props.grid[0],
          gridRowEnd: this.props.grid[1],
          gridColumnStart: this.props.grid[2],
          gridColumnEnd: this.props.grid[3],
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
