import WebSocket from 'ws';
import { wsController } from './controller/ws';

export const StartWS = () => {
  const wss = new WebSocket.Server({ port: 3000 });

  wss.on('connection', async (ws) => {
    console.log('Client connected');

    await wsController(ws, wss);
  });
  wss.on('error', (err) => {
    console.log(err);
  });
};
