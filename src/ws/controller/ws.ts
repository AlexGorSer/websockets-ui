import WebSocket from 'ws';
import { ReqType, RequestI, UpdateRoomI, UserArrI } from '../types/types';
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
    const parseJSON: RequestI = await JSON.parse(message.toString());

    if (parseJSON.type === ReqType.REG) {
      await createPlayer(parseJSON, ws, clientId, createdUsers);
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === ReqType.CREATE_ROOM) {
      await createRoom(clientId, createdUsers, availableRoomArr);
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === ReqType.ADD_USER) {
      await addUserToRoom(
        parseJSON.data,
        clientId,
        createdUsers,
        availableRoomArr,
        roomInGame,
      );
      await createGame(roomInGame, clients);
      await UpdateRoom(wss, availableRoomArr);
    }
  });

  ws.on('close', () => {
    console.log(`Dis ${clientId}`);
    clients.delete(clientId);
  });
};
