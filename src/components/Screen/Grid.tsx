import React from 'react';
import './index.scss';

interface Props {
  grid: [number, number]; // [rows, columns]
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  initGridSize?: {
    rows: string[];
    columns: string[];
  }; // 每行每列的初始大小，格式为 ["100px", "1fr", "2fr"]，长度应等于行数或列数
  onSizeChange?: (rows: string[], columns: string[]) => void; // position: [row, column], size: [width, height]
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
    const children: React.ReactNode[] = [];
    if (this.props.children) {
      React.Children.forEach(this.props.children, (child, index) => {
        if (React.isValidElement(child)) {
          children.push(
            React.cloneElement(child, {
              key: index,
              parentGrid: this.props.grid,
              setGridSize: this.setGridSize,
            }),
          );
        }
      });
    }
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
  grid: [number, number, number, number]; // [startRow, endRow, startColumn, endColumn]
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
        style={
          (this.props.style,
          {
            gridRowStart: this.props.grid[0],
            gridRowEnd: this.props.grid[1],
            gridColumnStart: this.props.grid[2],
            gridColumnEnd: this.props.grid[3],
          })
        }
      >
        {this.props.children}
      </div>
    );
  }
}
