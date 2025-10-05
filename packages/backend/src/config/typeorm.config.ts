import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

// Environment-based configuration
const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'local';
const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'threadsharing',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],

  // Development/Test: Use synchronize for quick iteration
  // Production: Use migrations for safe, versioned changes
  synchronize: isDevelopment,

  // Only run migrations in production
  migrationsRun: isProduction,

  logging: isDevelopment,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
