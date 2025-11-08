import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ClientToServerEvents, ServerToClientEvents } from 'shared';
import { getGameState } from '../routes/game.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export function setupSocketHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
  // Authenticate socket connection
  const token = socket.handshake.auth.token;
  
  if (!token) {
    socket.disconnect();
    return;
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch (error) {
    socket.disconnect();
    return;
  }

  // Join player's room
  socket.join(`player:${userId}`);
  console.log(`Player ${userId} connected via WebSocket`);

  // Handle join game
  socket.on('join-game', async () => {
    try {
      const gameState = await getGameState(userId);
      socket.emit('game-state-update', gameState);
    } catch (error) {
      console.error('Join game error:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player ${userId} disconnected`);
  });
}
