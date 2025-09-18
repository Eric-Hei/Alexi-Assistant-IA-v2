import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Route proxy pour les modèles Albert
app.get('/api/albert/v1/models', async (req, res) => {
  try {
    console.log('Requête pour les modèles Albert');

    const response = await fetch('https://albert.api.etalab.gouv.fr/v1/models', {
      headers: {
        'Authorization': req.headers.authorization,
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
    
    const response = await fetch('https://albert.api.etalab.gouv.fr/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur proxy Albert démarré sur http://localhost:${PORT}`);
  console.log(`📡 Proxy API Albert: http://localhost:${PORT}/api/albert/v1/chat/completions`);
});
