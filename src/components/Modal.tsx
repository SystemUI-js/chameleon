import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Window, WindowProps } from './Window';
import { useLayeredZIndex } from './useLayeredZIndex';
import { useMountLayer } from './useMountLayer';
import './Modal.scss';

export interface ModalProps extends WindowProps {
  isOpen: boolean;
  onClose: () => void;
  clickOutsideToClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  clickOutsideToClose = false,
  className = '',
  ...windowProps
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const portalTarget = useMountLayer(
    'layer-popups',
    typeof document === 'undefined' ? null : document.body,
  );
  const { zIndex } = useLayeredZIndex('popups', isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClickOutside = (e: React.MouseEvent) => {
    if (clickOutsideToClose && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!portalTarget) return null;

  return ReactDOM.createPortal(
    <div
      className="cm-modal-overlay"
      ref={overlayRef}
      onClick={handleClickOutside}
      role="presentation"
      style={{ zIndex, pointerEvents: 'auto' }}
    >
      <div className={`cm-modal-content ${className}`}>
        <Window {...windowProps} onClose={onClose} />
      </div>
    </div>,
    portalTarget,
  );
};

export default Modal;
