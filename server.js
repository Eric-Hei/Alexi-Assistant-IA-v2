import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration Albert API
const ALBERT_API_KEY = process.env.ALBERT_API_KEY;
const ALBERT_API_URL = 'https://albert.api.etalab.gouv.fr';

// Configuration persistance personas
const PERSONAS_FILE = 'data/personas.json';

if (!ALBERT_API_KEY) {
  console.warn('⚠️  ALBERT_API_KEY non trouvée en local - Le serveur proxy Railway sera utilisé');
  console.log('ℹ️  En développement local, les requêtes passeront par le proxy Railway');
}

// Configuration CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://alexi-assistant-ia.netlify.app'
  ],
  credentials: true
}));

app.use(express.json());

// Fonctions utilitaires pour la validation
const validatePersona = (persona) => {
  return (
    persona &&
    persona.name && typeof persona.name === 'string' && persona.name.length <= 100 &&
    persona.prompt && typeof persona.prompt === 'string' && persona.prompt.length <= 5000 &&
    (!persona.description || (typeof persona.description === 'string' && persona.description.length <= 500)) &&
    (!persona.category || typeof persona.category === 'string') &&
    (!persona.color || typeof persona.color === 'string') &&
    (!persona.icon || typeof persona.icon === 'string')
  );
};

const validatePersonasData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.personas)) return false;
  if (data.personas.length > 50) return false; // Limite de 50 personas

  return data.personas.every(validatePersona);
};

// Routes pour la gestion des personas
app.get('/api/personas', async (req, res) => {
  try {
    console.log('📥 Requête GET /api/personas');

    const data = await fs.readFile(PERSONAS_FILE, 'utf8');
    const personas = JSON.parse(data);

    console.log(`✅ Personas chargés: ${personas.personas?.length || 0} personas`);
    res.json(personas);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📄 Fichier personas.json non trouvé, retour données vides');
      // Fichier n'existe pas, retourner structure vide
      res.json({ personas: [], defaultPersonaId: null });
    } else {
      console.error('❌ Erreur lecture fichier personas:', error);
      res.status(500).json({ error: 'Erreur lecture fichier personas' });
    }
  }
});

app.post('/api/personas', async (req, res) => {
  try {
    console.log('📤 Requête POST /api/personas');

    const { personas, defaultPersonaId } = req.body;

    // Validation des données
    if (!validatePersonasData({ personas, defaultPersonaId })) {
      console.log('❌ Validation échouée pour les données personas');
      return res.status(400).json({ error: 'Format de données invalide' });
    }

    const data = {
      personas,
      defaultPersonaId,
      updatedAt: new Date().toISOString()
    };

    // Créer le dossier data s'il n'existe pas
    await fs.mkdir('data', { recursive: true });

    // Sauvegarder
    await fs.writeFile(PERSONAS_FILE, JSON.stringify(data, null, 2));

    console.log(`✅ Personas sauvegardés: ${personas.length} personas`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur sauvegarde personas:', error);
    res.status(500).json({ error: 'Erreur sauvegarde personas' });
  }
});

// Route proxy pour les modèles Albert
app.get('/api/albert/v1/models', async (req, res) => {
  try {
    console.log('Requête pour les modèles Albert');

    if (!ALBERT_API_KEY) {
      return res.status(503).json({
        error: {
          message: 'Serveur proxy local non configuré - Utilisez le serveur Railway en production'
        }
      });
    }

    const response = await fetch(`${ALBERT_API_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${ALBERT_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('Réponse modèles Albert:', response.status, responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: {
          message: `Erreur API Albert modèles (${response.status}): ${responseText}`
        }
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: {
          message: 'Réponse invalide de l\'API Albert modèles: ' + responseText
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur proxy Albert modèles:', error);
    res.status(500).json({
      error: {
        message: 'Erreur du serveur proxy modèles: ' + error.message
      }
    });
  }
});

// Route proxy pour l'API Albert
app.post('/api/albert/v1/chat/completions', async (req, res) => {
  try {
    console.log('Requête reçue pour Albert API:', req.body);

    if (!ALBERT_API_KEY) {
      return res.status(503).json({
        error: {
          message: 'Serveur proxy local non configuré - Utilisez le serveur Railway en production'
        }
      });
    }

    const response = await fetch(`${ALBERT_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALBERT_API_KEY}`,
      },
      body: JSON.stringify(req.body)
    });

    const responseText = await response.text();
    console.log('Réponse brute Albert:', response.status, responseText);

    if (!response.ok) {
      console.error('Erreur API Albert:', response.status, responseText);
      return res.status(response.status).json({
        error: {
          message: `Erreur API Albert (${response.status}): ${responseText}`
        }
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      return res.status(500).json({
        error: {
          message: 'Réponse invalide de l\'API Albert: ' + responseText
        }
      });
    }

    console.log('Réponse Albert API reçue avec succès');
    res.json(data);
  } catch (error) {
    console.error('Erreur proxy Albert:', error);
    res.status(500).json({ 
      error: { 
        message: 'Erreur du serveur proxy: ' + error.message 
      } 
    });
  }
});

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur proxy Albert fonctionnel' });
});

// Gestionnaire d'erreurs global
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejetée non gérée:', reason);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur proxy Albert démarré sur http://localhost:${PORT}`);
  console.log(`📡 Proxy API Albert: http://localhost:${PORT}/api/albert/v1/chat/completions`);
  console.log(`📋 Routes personas: GET/POST ${PORT}/api/personas`);
});

// Garder le serveur en vie
server.on('error', (error) => {
  console.error('❌ Erreur serveur:', error);
});
