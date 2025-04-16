export const executeQuery = async (query: string) => {
  console.log('useDatabase: Début executeQuery avec:', query);
  try {
    // Log de la requête brute
    console.log('useDatabase: Requête brute reçue:', query);

    // Nettoyer la requête (supprimer les espaces et retours à la ligne inutiles)
    const cleanedQuery = query.trim();
    console.log('useDatabase: Requête nettoyée:', cleanedQuery);

    const requestBody = JSON.stringify({
      options: {
        databaseType: 'sqlite',
        operation: 'query',
        connection: './data/default.db',
        query: cleanedQuery
      }
    });
    console.log('useDatabase: Corps de la requête:', requestBody);

    const response = await fetch('http://localhost:3003/api/database/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    console.log('useDatabase: Statut de la réponse:', response.status);
    const data = await response.json();
    console.log('useDatabase: Données reçues:', data);
    return data.data;
  } catch (error) {
    console.error('useDatabase: Erreur lors de l\'exécution de la requête:', error);
    console.error('useDatabase: Query en erreur:', query);
    throw error;
  }
}
