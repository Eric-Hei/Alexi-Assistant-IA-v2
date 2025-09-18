import React, { useState, useEffect } from 'react';
import { Persona } from '../types';

interface PersonaInputProps {
  onPersonaSet: (persona: string) => void;
}

const PersonaInput: React.FC<PersonaInputProps> = ({ onPersonaSet }) => {
  const [persona, setPersona] = useState<string>('');
  const [presetPersonas, setPresetPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('personas.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPresetPersonas(data);
      } catch (e) {
        console.error("Could not fetch personas:", e);
        setError("Could not load preset personas.");
      }
    };
    fetchPersonas();
  }, []);

  const handleSetExample = (example: string) => {
    setPersona(example);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (persona.trim()) {
      onPersonaSet(persona.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-8 transform transition-all">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Specialize Your Chatbot</h1>
        <p className="text-center text-gray-400 mb-6">Define the personality and expertise of your AI assistant. Write your own or choose a preset.</p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="e.g., You are a witty historian who specializes in the Roman Empire..."
            className="w-full h-40 p-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow resize-none"
            aria-label="Chatbot persona definition"
          />
          <button
            type="submit"
            disabled={!persona.trim()}
            className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 text-lg"
          >
            Start Chat
          </button>
        </form>

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {presetPersonas.length > 0 && (
            <div className="mt-8">
                <h2 className="text-sm font-semibold text-gray-500 text-center uppercase tracking-wider">Or choose a preset</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {presetPersonas.map((p, index) => (
                        <button 
                            key={index}
                            onClick={() => handleSetExample(p.prompt)}
                            className="bg-gray-700 text-gray-300 text-sm py-3 px-4 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Select ${p.name} persona`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PersonaInput;
