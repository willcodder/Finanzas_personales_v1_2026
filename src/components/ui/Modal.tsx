import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, width = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile: bottom sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <motion.div
              className={`bg-card rounded-t-2xl border-t border-border overflow-hidden max-h-[92vh] flex flex-col`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-8 h-1 rounded-full bg-border" />
              </div>
              {title && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                  <h2 className="text-sm font-semibold text-ink">{title}</h2>
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-muted">
                    <X size={15} />
                  </button>
                </div>
              )}
              <div className="overflow-y-auto flex-1">{children}</div>
            </motion.div>
          </div>

          {/* Desktop: centered dialog */}
          <div className="hidden md:flex fixed inset-0 items-center justify-center z-50 p-6">
            <motion.div
              className={`bg-card rounded-xl border border-border w-full ${width} max-h-[85vh] flex flex-col shadow-dropdown`}
              initial={{ opacity: 0, scale: 0.97, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.15 }}
            >
              {title && (
                <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                  <h2 className="text-sm font-semibold text-ink">{title}</h2>
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-muted">
                    <X size={15} />
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
