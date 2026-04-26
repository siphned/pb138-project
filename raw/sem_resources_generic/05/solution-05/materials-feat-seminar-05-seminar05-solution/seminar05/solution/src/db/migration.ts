import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, closeConnection } from './db';

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: 'drizzle',
    });

    console.log('Migration script completed');
  } catch (error) {
    console.error('Migration script failed:', error);
  } finally {
    await closeConnection();
  }
};

main();
