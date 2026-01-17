import React, { useState, ReactNode } from 'react'
import './Tree.css'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

export interface TreeProps {
  data: TreeNode[]
  className?: string
}

const TreeNodeItem: React.FC<{ node: TreeNode; level: number }> = ({
  node,
  level
}) => {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className='cm-tree-node'>
      <div
        className='cm-tree-node__content'
        style={{ paddingLeft: level * 16 }}
      >
        {hasChildren ? (
          <div
            className='cm-tree-node__toggle'
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? '-' : '+'}
          </div>
        ) : (
          <div style={{ width: 13 }} />
        )}
        <span className='cm-tree-node__label'>{node.label}</span>
      </div>
      {expanded &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNodeItem key={child.id} node={child} level={level + 1} />
        ))}
    </div>
  )
}

export const Tree: React.FC<TreeProps> = ({ data, className = '' }) => {
  return (
    <div className={`cm-tree ${className}`}>
      {data.map((node) => (
        <TreeNodeItem key={node.id} node={node} level={0} />
      ))}
    </div>
  )
}

export default Tree
