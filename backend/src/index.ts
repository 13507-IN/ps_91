import { loadEnv } from './config/env.js';
import { buildApp } from './app.js';

// ============================================================
// Server Entry Point
// ============================================================

async function start() {
  // Load and validate environment variables first
  const env = loadEnv();

  const app = await buildApp();

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
    
    app.log.info(`🚀 Server listening at http://${env.HOST}:${env.PORT}`);
    app.log.info(`📚 Swagger docs available at http://${env.HOST}:${env.PORT}/docs`);
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

start();
