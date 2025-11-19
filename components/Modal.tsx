'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="bento-panel w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold z-10 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        )}
        <div className="text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}

