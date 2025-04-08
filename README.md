# Webflow Builder

Un constructeur de workflow visuel basé sur React Flow permettant de créer et gérer des flux de travail de manière intuitive.

## Fonctionnalités

- Interface glisser-déposer pour créer des workflows
- Nœuds personnalisables (schedule, output, etc.)
- Thème clair/sombre
- Panneau de propriétés pour configurer les nœuds
- Gestion des connexions entre nœuds

## Technologies utilisées

- React
- TypeScript
- React Flow
- Tailwind CSS
- Framer Motion
- Zustand

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/pat13310/webflow-builder.git

# Installer les dépendances
cd webflow-builder
npm install

# Lancer l'application en mode développement
npm run dev
```

## Structure du projet

```
webflow-builder/
├── src/
│   ├── components/      # Composants React
│   ├── store/          # État global (Zustand)
│   ├── hooks/          # Hooks personnalisés
│   └── App.tsx         # Composant principal
├── public/             # Ressources statiques
└── package.json        # Dépendances et scripts
```

## Licence

MIT