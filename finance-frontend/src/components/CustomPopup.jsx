import React, { useEffect } from 'react';

/**
 * CustomPopup component for displaying alerts, notifications, and messages
 * 
 * @param {Object} props
 * @param {string} props.type - Type of popup: 'success', 'error', 'info', 'warning'
 * @param {string} props.message - Message to display in the popup
 * @param {boolean} props.show - Whether to show the popup
 * @param {function} props.onClose - Function to call when closing the popup
 * @param {number} props.autoCloseTime - Time in ms after which the popup should auto-close (0 to disable)
 * @param {string} props.position - Position of the popup: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'center'
 */
const CustomPopup = ({ 
  type = 'info', 
  message, 
  show, 
  onClose, 
  autoCloseTime = 3000,
  position = 'bottom-right'
}) => {
  // Auto-close timer
  useEffect(() => {
    if (show && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoCloseTime, onClose]);

  if (!show) return null;

  // Define styles based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100',
          borderColor: 'border-green-400',
          textColor: 'text-green-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-400',
          textColor: 'text-red-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  // Define position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4';
      case 'top-left':
        return 'fixed top-4 left-4';
      case 'bottom-left':
        return 'fixed bottom-4 left-4';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-right':
      default:
        return 'fixed bottom-4 right-4';
    }
  };

  const { bgColor, borderColor, textColor, icon } = getTypeStyles();
  const positionClass = getPositionStyles();

  // Get animation based on position
  const getAnimationClass = () => {
    switch (position) {
      case 'top-right':
        return 'animate-slide-in-right';
      case 'top-left':
        return 'animate-slide-in-left';
      case 'bottom-left':
        return 'animate-slide-in-left';
      case 'bottom-right':
        return 'animate-slide-in-right';
      case 'center':
        return 'animate-fade-in';
      default:
        return 'animate-fade-in';
    }
  };

  const animationClass = getAnimationClass();

  return (
    <div className={`${positionClass} z-50 ${animationClass}`}>
      <div className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded-lg shadow-md max-w-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <span className="ml-2 text-sm font-medium">{message}</span>
          </div>
          <button 
            onClick={onClose}
            className={`ml-4 ${textColor} hover:opacity-75 focus:outline-none`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPopup;