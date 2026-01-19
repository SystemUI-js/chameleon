import React from 'react'
import Button from './Button'
import './Pagination.scss'

export interface PaginationProps {
  current: number
  total: number
  pageSize?: number
  onChange?: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize = 10,
  onChange,
  className = ''
}) => {
  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange?.(page)
    }
  }

  return (
    <div className={`cm-pagination ${className}`}>
      <Button
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
        style={{ minWidth: 'auto', padding: '0 4px' }}
      >
        &lt;
      </Button>

      {/* Simplified pagination logic: Show all or truncated? showing simplified for now */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === current ? 'primary' : 'secondary'}
          onClick={() => handlePageChange(page)}
          style={{
            minWidth: 'auto',
            padding: '0 8px',
            fontWeight: page === current ? 'bold' : 'normal'
          }}
        >
          {page}
        </Button>
      ))}

      <Button
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
        style={{ minWidth: 'auto', padding: '0 4px' }}
      >
        &gt;
      </Button>
    </div>
  )
}

export default Pagination
