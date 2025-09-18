
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  
  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-gray-700 text-gray-200';

  return (
    <div className={containerClasses}>
      <div className={`rounded-xl p-3 max-w-xl md:max-w-2xl ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
