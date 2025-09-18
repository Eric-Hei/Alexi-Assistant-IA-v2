
import React, { useEffect, useRef, useState } from 'react';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
    setShowScrollToBottom(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setIsUserScrolling(!isAtBottom);
    setShowScrollToBottom(!isAtBottom);
  };

  useEffect(() => {
    // Scroll automatique seulement si l'utilisateur n'est pas en train de faire défiler
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isLoading, isUserScrolling]);

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
      <div className="flex-1 relative">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-6 space-y-4"
          onScroll={handleScroll}
        >
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

        {/* Bouton pour revenir en bas */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            title="Aller au bas de la conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
