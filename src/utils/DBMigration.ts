import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDbConnection } from './DBConnection';

// Create a new and dedicated database connection for running migrations
const db = createDbConnection();

try {
  // Only run migrations if we have a valid database connection
  if (process.env.DATABASE_URL) {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
  }
} catch (error) {
  // Silently ignore database migration errors in development
  console.warn('Database migration skipped:', error.message);
} finally {
  try {
    await db.$client.end();
  } catch (error) {
    // Silently ignore connection close errors
  }
}
