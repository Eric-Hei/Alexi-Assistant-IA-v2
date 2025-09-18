
import React, { useEffect, useRef } from 'react';
import { Message, Persona } from '../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  currentPersona: Persona | null;
  onNewConversation: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, currentPersona, onNewConversation }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header avec bouton nouvelle conversation */}
      {currentPersona && messages.length > 0 && (
        <div className="border-b border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-lg">{currentPersona.icon}</div>
            <h3 className="text-white font-medium text-sm">{currentPersona.name}</h3>
          </div>

          {/* Bouton Nouvelle conversation */}
          <button
            onClick={onNewConversation}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            title="Commencer une nouvelle conversation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm">Nouvelle conversation</span>
          </button>
        </div>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
           <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg p-3 max-w-2xl">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
