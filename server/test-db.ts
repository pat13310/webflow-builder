import { executeDatabase } from './databaseExecutor';

async function testDatabase() {
  try {
    // Insérer un utilisateur
    console.log('Insertion d\'un utilisateur...');
    const insertResult = await executeDatabase({
      databaseType: 'sqlite',
      connection: './data/default.db',
      operation: 'execute',
      query: "INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com')"
    });
    console.log('Résultat de l\'insertion:', insertResult);

    // Lire les utilisateurs
    console.log('\nLecture des utilisateurs...');
    const selectResult = await executeDatabase({
      databaseType: 'sqlite',
      connection: './data/default.db',
      operation: 'query',
      query: "SELECT * FROM users"
    });
    console.log('Utilisateurs dans la base de données:', selectResult);

    // Insérer un projet
    console.log('\nInsertion d\'un projet...');
    const insertProjectResult = await executeDatabase({
      databaseType: 'sqlite',
      connection: './data/default.db',
      operation: 'execute',
      query: "INSERT INTO projects (name, description, user_id) VALUES ('Test Project', 'Description du projet', 1)"
    });
    console.log('Résultat de l\'insertion du projet:', insertProjectResult);

    // Lire les projets avec leurs utilisateurs
    console.log('\nLecture des projets avec leurs utilisateurs...');
    const selectProjectsResult = await executeDatabase({
      databaseType: 'sqlite',
      connection: './data/default.db',
      operation: 'query',
      query: `
        SELECT projects.*, users.name as user_name, users.email as user_email
        FROM projects
        LEFT JOIN users ON projects.user_id = users.id
      `
    });
    console.log('Projets dans la base de données:', selectProjectsResult);

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testDatabase();
