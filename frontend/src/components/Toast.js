import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {onClose && <button className="toast-close" onClick={handleClose}>×</button>}
      </div>
    </div>
  );
};

export default Toast;

