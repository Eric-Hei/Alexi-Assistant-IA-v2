import { useState, useCallback } from 'react';
import { Persona } from '../types';

interface CloudSyncData {
  personas: Persona[];
  timestamp: number;
  version: string;
}

export const useCloudSync = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Service de stockage simple via JSONBin.io (gratuit, sans inscription)
  const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';

  const uploadToCloud = useCallback(async (personas: Persona[]): Promise<string | null> => {
    setIsUploading(true);
    try {
      const data: CloudSyncData = {
        personas,
        timestamp: Date.now(),
        version: '1.0'
      };

      const response = await fetch(JSONBIN_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bin-Name': 'alexi-personas-backup'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const result = await response.json();
      const binId = result.metadata.id;
      const shareUrl = `https://api.jsonbin.io/v3/b/${binId}/latest`;
      
      setShareUrl(shareUrl);
      return shareUrl;
    } catch (error) {
      console.error('Erreur upload cloud:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const downloadFromCloud = useCallback(async (url: string): Promise<Persona[] | null> => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const result = await response.json();
      const data: CloudSyncData = result.record || result;
      
      if (!data.personas || !Array.isArray(data.personas)) {
        throw new Error('Format de données invalide');
      }

      return data.personas;
    } catch (error) {
      console.error('Erreur download cloud:', error);
      return null;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const generateShareableLink = useCallback(async (personas: Persona[]): Promise<string | null> => {
    const url = await uploadToCloud(personas);
    if (url) {
      // Créer un lien plus convivial
      const binId = url.split('/').slice(-2, -1)[0];
      return `${window.location.origin}?import=${binId}`;
    }
    return null;
  }, [uploadToCloud]);

  const extractBinIdFromUrl = useCallback((url: string): string | null => {
    try {
      // Supporter différents formats d'URL
      if (url.includes('import=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        return urlParams.get('import');
      }
      
      if (url.includes('jsonbin.io')) {
        const parts = url.split('/');
        return parts[parts.length - 2];
      }
      
      return null;
    } catch {
      return null;
    }
  }, []);

  const extractGoogleDriveId = useCallback((url: string): string | null => {
    try {
      // Support pour les liens Google Drive
      const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      return driveMatch ? driveMatch[1] : null;
    } catch {
      return null;
    }
  }, []);

  const downloadFromGoogleDrive = useCallback(async (fileId: string): Promise<Persona[] | null> => {
    try {
      // URL de téléchargement direct Google Drive
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Impossible de télécharger le fichier Google Drive');
      }

      const text = await response.text();

      // Vérifier si c'est une page HTML (redirection de connexion)
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
        throw new Error('Le fichier Google Drive n\'est pas accessible publiquement. Veuillez vérifier les permissions de partage.');
      }

      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Format de fichier invalide');
      }

      return data as Persona[];
    } catch (error) {
      console.error('Erreur lors du téléchargement Google Drive:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors du téléchargement depuis Google Drive');
    }
  }, []);

  const downloadFromDirectUrl = useCallback(async (url: string): Promise<Persona[] | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('Format de fichier invalide');
      }

      return data as Persona[];
    } catch (error) {
      console.error('Erreur lors du téléchargement direct:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors du téléchargement');
    }
  }, []);

  const importFromShareableLink = useCallback(async (shareableUrl: string): Promise<Persona[] | null> => {
    // Essayer d'abord Google Drive
    const driveId = extractGoogleDriveId(shareableUrl);
    if (driveId) {
      return downloadFromGoogleDrive(driveId);
    }

    // Sinon essayer JSONBin
    const binId = extractBinIdFromUrl(shareableUrl);
    if (!binId) {
      throw new Error('URL de partage invalide. Formats supportés : Google Drive ou JSONBin.io');
    }

    const apiUrl = `${JSONBIN_BASE_URL}/${binId}/latest`;
    return downloadFromCloud(apiUrl);
  }, [downloadFromCloud, extractBinIdFromUrl, extractGoogleDriveId, downloadFromGoogleDrive]);

  return {
    isUploading,
    isDownloading,
    shareUrl,
    uploadToCloud,
    downloadFromCloud,
    generateShareableLink,
    importFromShareableLink,
    setShareUrl
  };
};
