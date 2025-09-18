
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role } from './types';
import PersonaInput from './components/PersonaInput';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [persona, setPersona] = useState<string>('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initializeChat = useCallback((specialization: string) => {
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: specialization,
        },
      });
      setPersona(specialization);
      setChatSession(newChatSession);
      setMessages([]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Chat initialization failed:", errorMessage);
      setError(`Failed to initialize chatbot. Please check your API key and configuration. Details: ${errorMessage}`);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chatSession || isLoading) return;

    const userMessage: Message = { role: Role.USER, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatSession.sendMessageStream({ message: text });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: Role.MODEL, text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = modelResponse;
          return newMessages;
        });
      }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during message streaming.';
        console.error("Error sending message:", errorMessage);
        setError(`Sorry, something went wrong. ${errorMessage}`);
        // Remove the empty model message placeholder on error
        setMessages(prev => prev.filter((msg, index) => !(index === prev.length - 1 && msg.role === Role.MODEL && msg.text === '')));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setPersona('');
    setChatSession(null);
    setMessages([]);
    setError(null);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
      {!chatSession ? (
        <PersonaInput onPersonaSet={initializeChat} />
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center z-10">
            <div>
              <h1 className="text-xl font-bold text-white">Specialized Chatbot</h1>
              <p className="text-sm text-gray-400 truncate max-w-md">Persona: {persona}</p>
            </div>
            <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                Reset
            </button>
          </header>

          {error && (
            <div className="bg-red-500 text-white p-3 m-4 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          <ChatWindow messages={messages} isLoading={isLoading} />
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default App;
