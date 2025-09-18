import React, { useState } from 'react';
import { Persona, PersonaCategory } from '../types';
import CategoryManager from './CategoryManager';

interface SidebarProps {
  personas: Persona[];
  currentPersonaId: string | null;
  collapsed: boolean;
  onPersonaSelect: (persona: Persona) => void;
  onPersonaCreate: () => void;
  onPersonaEdit: (persona: Persona) => void;
  onPersonaDelete: (persona: Persona) => void;
  onToggleCollapse: () => void;
  onImportPersonas?: (personas: Persona[]) => void;
  onExportPersonas?: () => void;
  onCloudSync?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  personas,
  currentPersonaId,
  collapsed,
  onPersonaSelect,
  onPersonaCreate,
  onPersonaEdit,
  onPersonaDelete,
  onToggleCollapse,
  onImportPersonas,
  onExportPersonas,
  onCloudSync,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || persona.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.values(PersonaCategory);

  const getCategoryLabel = (category: PersonaCategory) => {
    const labels = {
      [PersonaCategory.PROFESSIONAL]: 'Professionnel',
      [PersonaCategory.CREATIVE]: 'Créatif',
      [PersonaCategory.EDUCATIONAL]: 'Éducatif',
      [PersonaCategory.ENTERTAINMENT]: 'Divertissement',
      [PersonaCategory.PERSONAL]: 'Personnel',
      [PersonaCategory.TECHNICAL]: 'Technique',
      [PersonaCategory.OTHER]: 'Autre'
    };
    return labels[category] || category;
  };

  const getPersonaIcon = (persona: Persona) => {
    if (persona.icon) return persona.icon;
    switch (persona.category) {
      case PersonaCategory.PROFESSIONAL: return '💼';
      case PersonaCategory.CREATIVE: return '🎨';
      case PersonaCategory.EDUCATIONAL: return '📚';
      case PersonaCategory.ENTERTAINMENT: return '🎭';
      case PersonaCategory.PERSONAL: return '👤';
      case PersonaCategory.TECHNICAL: return '⚙️';
      default: return '🤖';
    }
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 md:flex hidden">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Développer la barre latérale"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <div className="flex flex-col space-y-2 flex-1 overflow-y-auto">
          {personas.slice(0, 8).map((persona) => (
            <button
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
                currentPersonaId === persona.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={persona.name}
            >
              {getPersonaIcon(persona)}
            </button>
          ))}
        </div>
        
        <button
          onClick={onPersonaCreate}
          className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center text-white transition-colors mt-2"
          title="Ajouter un nouvel assistant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 md:w-80 w-full bg-gray-800 border-r border-gray-700 flex flex-col md:relative absolute md:translate-x-0 z-30">
      {/* Mobile Overlay */}
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={onToggleCollapse}></div>

      {/* Header */}
      <div className="p-4 border-b border-gray-700 relative z-30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Assistants</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Réduire la barre latérale"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Rechercher des assistants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Rechercher des assistants"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as PersonaCategory | 'all')}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filtrer par catégorie"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Personas List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredPersonas.map((persona) => (
            <div
              key={persona.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                currentPersonaId === persona.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => onPersonaSelect(persona)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg flex-shrink-0">
                  {getPersonaIcon(persona)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{persona.name}</h3>
                    {persona.isDefault && (
                      <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                        Par défaut
                      </span>
                    )}
                  </div>
                  {persona.description && (
                    <p className="text-sm opacity-75 truncate mt-1">{persona.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-60 capitalize">
                      {persona.category || 'other'}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPersonaEdit(persona);
                        }}
                        className="p-1 hover:bg-gray-500 rounded opacity-70 hover:opacity-100 transition-opacity"
                        title="Modifier l'assistant"
                        aria-label={`Modifier ${persona.name}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!persona.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPersonaDelete(persona);
                          }}
                          className="p-1 hover:bg-red-500 rounded opacity-70 hover:opacity-100 transition-all"
                          title="Supprimer l'assistant"
                          aria-label={`Supprimer ${persona.name}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Button & Advanced Features */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        <button
          onClick={onPersonaCreate}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel Assistant</span>
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{showAdvanced ? 'Masquer' : 'Afficher'} les options</span>
        </button>

        {showAdvanced && (
          <div className="pt-2 space-y-3">
            {onImportPersonas && onExportPersonas && (
              <CategoryManager
                personas={personas}
                onImportPersonas={onImportPersonas}
                onExportPersonas={onExportPersonas}
              />
            )}

            {onCloudSync && (
              <button
                onClick={onCloudSync}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                title="Synchronisation cloud"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Synchronisation Cloud</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
