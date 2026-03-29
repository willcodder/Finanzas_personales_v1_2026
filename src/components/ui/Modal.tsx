import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile: slide up from bottom */}
          <div className="md:hidden">
            <motion.div
              className="fixed bottom-0 left-0 w-full z-50"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="bg-white dark:bg-[#1C1C1E] rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[#C7C7CC] dark:bg-[#3A3A3C]" />
                </div>
                {title && (
                  <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93]">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="overflow-y-auto flex-1">{children}</div>
              </div>
            </motion.div>
          </div>

          {/* Desktop: centered dialog */}
          <div className="hidden md:flex fixed inset-0 items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-apple-xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F2F7] dark:border-[#2C2C2E] flex-shrink-0">
                  <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white">{title}</h2>
                  <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93]">
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
