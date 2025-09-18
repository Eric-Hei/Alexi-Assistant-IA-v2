import React, { useState } from 'react';
import { Persona } from '../types';
import { useCloudSync } from '../hooks/useCloudSync';

interface CloudSyncProps {
  personas: Persona[];
  onImportPersonas: (personas: Persona[]) => void;
  onClose: () => void;
}

const CloudSync: React.FC<CloudSyncProps> = ({ personas, onImportPersonas, onClose }) => {
  const { 
    isUploading, 
    isDownloading, 
    shareUrl, 
    generateShareableLink, 
    importFromShareableLink,
    setShareUrl 
  } = useCloudSync();
  
  const [importUrl, setImportUrl] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');



  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleGenerateLink = async () => {
    try {

      const link = await generateShareableLink(personas);
      if (link) {
        showMessage('Lien de partage généré avec succès !', 'success');
      } else {
        showMessage('Erreur lors de la génération du lien', 'error');
      }
    } catch (error) {
      console.error('Erreur génération lien:', error);
      showMessage('Erreur lors de la génération du lien', 'error');
    }
  };

  const handleImport = async () => {
    if (!importUrl.trim()) {
      showMessage('Veuillez entrer une URL valide', 'error');
      return;
    }

    try {
      const importedPersonas = await importFromShareableLink(importUrl);
      if (importedPersonas && importedPersonas.length > 0) {
        onImportPersonas(importedPersonas);
        showMessage(`${importedPersonas.length} assistant(s) importé(s) avec succès !`, 'success');
        setImportUrl('');
      } else {
        showMessage('Aucun assistant trouvé dans le lien', 'error');
      }
    } catch (error) {
      showMessage('Erreur lors de l\'importation: ' + (error as Error).message, 'error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('Lien copié dans le presse-papiers !', 'success');
    } catch (error) {
      showMessage('Erreur lors de la copie', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Synchronisation Cloud</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message de statut */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-900 text-green-200 border border-green-700' 
              : 'bg-red-900 text-red-200 border border-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Section Export */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">📤 Exporter vos assistants</h3>
          <p className="text-gray-400 text-sm mb-3">
            Générez un lien de partage pour sauvegarder vos assistants dans le cloud
          </p>
          
          <button
            onClick={handleGenerateLink}
            disabled={isUploading || personas.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Génération...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Générer un lien de partage</span>
              </>
            )}
          </button>

          {shareUrl && (
            <div className="mt-3 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Lien de partage généré :</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-600 text-white text-xs p-2 rounded border-none"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded"
                  title="Copier"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section Import */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">📥 Importer des assistants</h3>
          <p className="text-gray-400 text-sm mb-3">
            Collez un lien de partage pour importer des assistants
          </p>
          <p className="text-gray-500 text-xs mb-3">
            Formats supportés : Google Drive, JSONBin.io ou liens générés par cette application
          </p>
          
          <div className="space-y-3">
            <input
              type="text"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... ou autre lien de partage"
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            
            <button
              onClick={handleImport}
              disabled={isDownloading || !importUrl.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importation...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 11l3 3m0 0l3-3m-3 3V8" />
                  </svg>
                  <span>Importer les assistants</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500 border-opacity-30">
          <p className="text-blue-200 text-xs">
            💡 <strong>Astuce :</strong> Sauvegardez votre lien de partage dans vos favoris pour accéder à vos assistants depuis n'importe quel appareil !
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudSync;
