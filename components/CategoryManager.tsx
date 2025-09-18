import React, { useState } from 'react';
import { Persona, PersonaCategory } from '../types';

interface CategoryManagerProps {
  personas: Persona[];
  onImportPersonas: (personas: Persona[]) => void;
  onExportPersonas: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  personas,
  onImportPersonas,
  onExportPersonas,
}) => {
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const customPersonas = personas.filter(p => p.isCustom);
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      personas: customPersonas,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alexi-personas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onExportPersonas();
  };

  const handleImport = () => {
    try {
      setImportError('');
      const data = JSON.parse(importData);
      
      if (!data.personas || !Array.isArray(data.personas)) {
        throw new Error('Format invalide : tableau d\'assistants non trouvé');
      }
      
      // Validate persona structure
      const validPersonas = data.personas.filter((persona: any) => {
        return (
          persona.name &&
          persona.prompt &&
          typeof persona.name === 'string' &&
          typeof persona.prompt === 'string'
        );
      });
      
      if (validPersonas.length === 0) {
        throw new Error('Aucun assistant valide trouvé dans les données d\'importation');
      }
      
      // Generate new IDs and mark as custom
      const importedPersonas: Persona[] = validPersonas.map((persona: any) => ({
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: persona.name,
        prompt: persona.prompt,
        description: persona.description || '',
        category: persona.category || PersonaCategory.OTHER,
        color: persona.color || '#3B82F6',
        icon: persona.icon || '🤖',
        isDefault: false,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      onImportPersonas(importedPersonas);
      setShowImportModal(false);
      setImportData('');
      
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Format JSON invalide');
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    personas.forEach(persona => {
      const category = persona.category || 'other';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Category Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Aperçu des catégories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400 capitalize">{category}</div>
              <div className="text-xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Import/Export */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Sauvegarde et Restauration</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exporter les assistants</span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Importer des assistants</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Importer des assistants</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coller les données JSON :
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                    placeholder="Collez ici vos données d'assistants exportées..."
                  />
                </div>
                
                {importError && (
                  <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
                    {importError}
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportData('');
                      setImportError('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Importer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
