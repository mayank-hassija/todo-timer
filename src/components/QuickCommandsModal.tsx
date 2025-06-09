import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface QuickCommand {
  command: string
  description: string
  defaultDuration: number
}

interface QuickCommandsModalProps {
  commands: QuickCommand[]
  onClose: () => void
  onSelect: (command: QuickCommand, duration: number) => void
}

const QuickCommandsModal: React.FC<QuickCommandsModalProps> = ({ commands, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quick Commands</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-2">
          {commands.map(cmd => (
            <button
              key={cmd.command}
              onClick={() => onSelect(cmd, cmd.defaultDuration)}
              className="w-full p-3 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-medium">{cmd.command}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {cmd.description} ({cmd.defaultDuration} min)
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickCommandsModal 