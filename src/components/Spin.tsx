import React from 'react'
import './Spin.scss'

export interface SpinProps {
  spinning?: boolean
  className?: string
}

export const Spin: React.FC<SpinProps> = ({
  spinning = true,
  className = ''
}) => {
  if (!spinning) return null
  return (
    <div className={`cm-spin ${className}`}>
      <div className='cm-spin-hourglass' />
    </div>
  )
}

export default Spin
