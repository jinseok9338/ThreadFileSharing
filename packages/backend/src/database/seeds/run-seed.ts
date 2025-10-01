import dataSource from '../../config/typeorm.config';
import { seedAuthData } from './auth.seed';

(async () => {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected!');

    await seedAuthData(dataSource);

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
})();
