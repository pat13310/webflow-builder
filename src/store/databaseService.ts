interface DatabaseRequest {
  options: {
    databaseType: string;
    operation: string;
    [key: string]: any;
  };
  input: any;
}

export async function executeDatabaseOperation(request: DatabaseRequest) {
  try {
    const response = await fetch('http://localhost:3003/api/database/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'exécution de la requête');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'appel au serveur de base de données:', error);
    throw error;
  }
}
