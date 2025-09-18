
import React, { useState } from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = useState(false);

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-gray-700 text-gray-200';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className={`${containerClasses} mb-4 group`}>
      <div className={`rounded-xl p-3 max-w-xl md:max-w-2xl relative ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Bouton de copie - visible au survol */}
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isUser
              ? 'hover:bg-blue-700 text-white'
              : 'hover:bg-gray-600 text-gray-300'
          }`}
          title="Copier le message"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Timestamp en bas */}
        <p className="text-xs mt-2 opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
