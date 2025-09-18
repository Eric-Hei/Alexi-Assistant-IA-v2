# Alexi Assistant IA v2

Une interface de chatbot IA moderne construite avec React, TypeScript et Vite, alimentée par l'API Albert d'Etalab.

## 🚀 Fonctionnalités

- **Interface multi-assistants** : Créez et gérez plusieurs personas IA
- **Sidebar responsive** : Navigation facile entre vos assistants
- **Gestion complète CRUD** : Créer, modifier, supprimer des assistants
- **Sauvegarde locale** : Vos assistants sont sauvegardés automatiquement
- **Import/Export** : Partagez vos configurations d'assistants
- **☁️ Synchronisation cloud** : Partagez vos assistants entre appareils via des liens
- **🔄 Nouvelle conversation** : Redémarrez une discussion avec le même assistant
- **📋 Copie facile** : Bouton de copie sur chaque message (visible au survol)
- **🔁 Retry automatique** : Gestion intelligente des erreurs temporaires d'Albert
- **Hauteur de saisie configurable** : Adaptez l'interface à vos besoins
- **Interface entièrement en français** : Conçue pour les utilisateurs français
- **API Albert** : Utilise l'IA française d'Etalab

## 🛠️ Technologies

- **React 19** - Framework frontend moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Vite** - Build tool ultra-rapide
- **API Albert** - IA française d'Etalab
- **TailwindCSS** - Framework CSS utilitaire
- **localStorage** - Persistance des données côté client

## 📦 Installation

1. Clonez le repository
```bash
git clone https://github.com/Eric-Hei/Alexi-Assistant-IA-v2.git
cd Alexi-Assistant-IA-v2
```

2. Installez les dépendances
```bash
npm install
```

3. **IMPORTANT** : Démarrez le serveur proxy ET l'application
```bash
# Option 1: Démarrage automatique (recommandé)
npm start

# Option 2: Démarrage manuel (2 terminaux)
# Terminal 1: Serveur proxy Albert
npm run proxy

# Terminal 2: Application React
npm run dev
```

4. Ouvrez votre navigateur sur `http://localhost:5174`

## ⚠️ **Prérequis important**

L'application nécessite un **serveur proxy** pour contourner les restrictions CORS de l'API Albert.
Le serveur proxy doit être démarré **avant** l'application React.

## 🔄 **Robustesse et Fiabilité**

L'application intègre un **système de retry automatique** pour gérer les erreurs temporaires d'Albert :
- **Détection automatique** des erreurs 500 (serveur temporairement indisponible)
- **Retry automatique** : Jusqu'à 3 tentatives avec délai de 1 seconde
- **Indicateur visuel** : L'utilisateur est informé des tentatives en cours
- **Transparence** : Aucune intervention manuelle requise

## 🔑 Configuration API Albert

L'application utilise l'API Albert d'Etalab. **Pour des raisons de sécurité, vous devez configurer votre propre clé API** :

1. **Obtenez votre clé API** sur https://albert.api.etalab.gouv.fr/
2. **Copiez le fichier d'exemple** : `cp .env.example .env`
3. **Modifiez le fichier .env** et remplacez `your_albert_api_key_here` par votre vraie clé API
4. **Redémarrez l'application** : `npm run start`

⚠️ **Important** : Ne jamais committer le fichier `.env` contenant votre vraie clé API !

**API Albert** : https://albert.api.etalab.gouv.fr/
- **Modèle par défaut** : `albert-large` (Mistral-Small-3.2-24B-Instruct)
- **Modèles disponibles** :
  - `albert-small` : Llama-3.1-8B-Instruct (64k tokens)
  - `albert-large` : Mistral-Small-3.2-24B-Instruct (128k tokens) ✅
  - `albert-code` : Qwen2.5-Coder-32B-Instruct (131k tokens)
  - `AgentPublic/albert-spp-8b` : Albert SPP 8B (46k tokens)
- Compatible avec l'interface OpenAI
- IA française développée par Etalab
- **Système de retry automatique** : En cas d'erreur 500, l'application retente automatiquement jusqu'à 3 fois

## 📖 Utilisation

1. **Sélection d'assistant** : Choisissez un assistant dans la barre latérale
2. **Création d'assistant** : Cliquez sur "Nouvel Assistant" pour créer votre propre persona
3. **Personnalisation** : Modifiez le nom, la description, le prompt système, l'icône et la couleur
4. **Conversation** : Commencez à discuter avec votre assistant IA
5. **Gestion** : Modifiez, supprimez ou définissez un assistant par défaut

## 🎨 Assistants par défaut

- **Assistant Utile** : Assistant polyvalent pour toutes vos questions
- **Assistant Locataire** : Expert en aide aux locataires en difficulté
- **Poète Shakespearien** : Répond en vers et dans le style de Shakespeare
- **Capitaine Pirate** : Assistant aventurier avec un langage de pirate

## 🔧 Développement

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 📁 Structure du projet

```
├── components/          # Composants React
│   ├── Sidebar.tsx     # Barre latérale des assistants
│   ├── ChatWindow.tsx  # Fenêtre de conversation
│   ├── MessageInput.tsx # Zone de saisie des messages
│   └── PersonaModal.tsx # Modal de création/édition
├── hooks/              # Hooks React personnalisés
│   ├── usePersonaManager.ts # Gestion des assistants
│   └── useSettings.ts  # Gestion des paramètres
├── services/           # Services API
│   └── albertApi.ts    # Service API Albert
├── types.ts           # Types TypeScript
└── App.tsx           # Composant principal
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.
