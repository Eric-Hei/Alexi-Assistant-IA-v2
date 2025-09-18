
import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  rows?: number;
  onRowsChange?: (rows: number) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  rows = 10,
  onRowsChange
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700">
      {/* Settings Row */}
      {onRowsChange && (
        <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
          <span>Hauteur de saisie :</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRowsChange(Math.max(1, rows - 1))}
              disabled={rows <= 1}
              className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Diminuer la hauteur"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center">{rows}</span>
            <button
              onClick={() => onRowsChange(Math.min(20, rows + 1))}
              disabled={rows >= 20}
              className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Augmenter la hauteur"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end bg-gray-700 rounded-xl p-3 space-x-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message... (Maj+Entrée pour nouvelle ligne, Entrée pour envoyer)"
          disabled={isLoading}
          rows={rows}
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none resize-none px-2 py-1"
          style={{ minHeight: `${rows * 1.5}rem` }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className="bg-blue-600 text-white rounded-lg p-3 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex-shrink-0"
          aria-label="Envoyer le message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(90 12 12)" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
