
import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
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
      <div className="flex items-center bg-gray-700 rounded-xl p-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none resize-none max-h-40 px-2"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className="bg-blue-600 text-white rounded-lg p-2 ml-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          aria-label="Send message"
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
