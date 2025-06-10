import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface KeyboardShortcut {
  key: string
  description: string
  category: 'Timer' | 'Tasks' | 'Routines' | 'General'
}

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ shortcuts, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const modalNode = modalRef.current;
    if (!modalNode) return;
    const focusableElements = modalNode.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    firstElement.focus();
    const handleTabKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };
    modalNode.addEventListener('keydown', handleTabKeyPress);
    return () => modalNode.removeEventListener('keydown', handleTabKeyPress);
  }, []);

  const categories = ['Timer', 'Tasks', 'Routines', 'General']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" ref={modalRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h3 className="font-medium mb-2">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map(shortcut => (
                    <div key={shortcut.key} className="flex justify-between items-center">
                      <span>{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal 