import React, { useState, useEffect } from 'react';

interface NotificationToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const NotificationToast: React.FC<NotificationToastProps> = ({ message, duration = 5000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleClose = () => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
  };

  return (
    <div 
      className={`relative w-80 max-w-sm p-4 rounded-xl shadow-lg transition-all duration-300 transform ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } neumorphic-convex`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-cyan-400 pt-0.5">
          <InfoIcon />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-white">Thông Báo</p>
          <p className="mt-1 text-sm text-neutral-300">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={handleClose} className="rounded-md inline-flex text-neutral-400 hover:text-white focus:outline-none">
            <span className="sr-only">Đóng</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;