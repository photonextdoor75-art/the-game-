import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Impossible de trouver l'élément racine 'root'");
}

try {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erreur critique au démarrage:", error);
  container.innerHTML = `
    <div style="color: #ff4545; padding: 20px; font-family: sans-serif; text-align: center; background: #120c18; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">⚠️ L'application n'a pas pu démarrer</h1>
        <p>Vérifiez la console (F12) pour plus de détails.</p>
        <pre style="background: #000; padding: 10px; border-radius: 5px; margin-top: 20px; text-align: left; overflow: auto; max-width: 100%; font-size: 12px;">${error}</pre>
    </div>
  `;
}