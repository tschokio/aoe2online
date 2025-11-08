import { app, httpServer, io } from './app.js';
import pool from './db.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import buildingRoutes from './routes/buildings.js';
import unitRoutes from './routes/units.js';
import { startGameLoop } from './game/gameLoop.js';
import { setupSocketHandlers } from './game/socket.js';

const PORT = process.env.PORT || 3000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', authenticateToken, gameRoutes);
app.use('/api/buildings', authenticateToken, buildingRoutes);
app.use('/api/units', authenticateToken, unitRoutes);

// Socket.io connection
io.on('connection', setupSocketHandlers);

// Start game loop
startGameLoop();

// Start server
httpServer.listen(PORT, async () => {
  console.log('========================================');
  console.log('🎮 Age of Empires Online Server');
  console.log('========================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Time acceleration: ${process.env.TIME_ACCELERATION || '1'}x`);
  
  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
  }
  
  console.log('========================================');
  console.log('Ready to accept connections!');
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await pool.end();
    process.exit(0);
  });
});
