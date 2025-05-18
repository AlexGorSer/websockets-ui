import WebSocket from 'ws';
import { RequestI, UpdateRoomI, UserArrI } from '../types/types';
import { randomUUID } from 'node:crypto';
import {
  createPlayer,
  UpdateRoom,
  createRoom,
  addUserToRoom,
  createGame,
} from './helpers';

export const clients = new Map();
const createdUsers: UserArrI[] = [];
const availableRoomArr: UpdateRoomI[] = [];
const roomInGame: UpdateRoomI[] = [];

export const wsController = async (ws: WebSocket, wss: WebSocket.Server) => {
  const clientId = randomUUID();
  clients.set(clientId, ws);

  ws.on('message', async (message) => {
    console.log('Received message:', message.toString());
    console.log(JSON.parse(message.toString()));
    const parseJSON: RequestI = await JSON.parse(message.toString());

    if (parseJSON.type === 'reg') {
      await createPlayer(parseJSON, ws, clientId, createdUsers);
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'create_room') {
      await createRoom(clientId, createdUsers, availableRoomArr);
      // console.log('create');
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'add_user_to_room') {
      await addUserToRoom(
        parseJSON.data,
        clientId,
        createdUsers,
        availableRoomArr,
        roomInGame,
      );
      await createGame(roomInGame, clients);
      // console.log('add');
      await UpdateRoom(wss, availableRoomArr);
    }
  });

  ws.on('close', () => {
    console.log(`Dis ${clientId}`);
    clients.delete(clientId);
    // console.log(clients);
  });
};
