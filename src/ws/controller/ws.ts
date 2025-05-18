import WebSocket from 'ws';
import {
  CreateLoginUserI,
  RequestI,
  UpdateRoomI,
  UserArrI,
} from '../types/types';
import { randomUUID } from 'node:crypto';

export const clients = new Map();
const createdUsers: UserArrI[] = [];
const availableRoomArr: UpdateRoomI[] = [];
const roomInGame: UpdateRoomI[] = [];

export const wsController = async (ws: WebSocket, wss: WebSocket.Server) => {
  const clientId = randomUUID();
  clients.set(clientId, ws);

  ws.on('message', async (message) => {
    console.log('Received message:', message.toString());
    const parseJSON: RequestI = await JSON.parse(message.toString());

    if (parseJSON.type === 'reg') {
      await createPlayer(parseJSON, ws, clientId);
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'create_room') {
      await createRoom(clientId);
      // console.log('create');
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'add_user_to_room') {
      await addUserToRoom(parseJSON.data, clientId);
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

const createPlayer = async (
  Json: RequestI,
  ws: WebSocket,
  clientId: string,
) => {
  const { data } = Json;
  const { name, password }: CreateLoginUserI = JSON.parse(data);
  const id = clientId;

  createdUsers.push({ name, password, id });
  console.log(`User ${name} create ${id}`);

  const sendUser: RequestI = {
    type: 'reg',
    data: JSON.stringify({
      name: name,
      index: id,
      error: false,
      errorText: '',
    }),
    id: 0,
  };

  ws.send(JSON.stringify(sendUser));
};

const createRoom = async (clientId: string) => {
  const indexRoom = randomUUID();
  const current = createdUsers.find((user) => user.id === clientId);

  if (!current) {
    return;
  }

  const room: UpdateRoomI = {
    roomId: indexRoom,
    roomUsers: [
      {
        name: current?.name,
        index: current?.id,
      },
    ],
  };

  availableRoomArr.push(room);
};

const UpdateRoom = async (
  wss: WebSocket.Server,
  arr: UpdateRoomI[] | UpdateRoomI,
) => {
  const sendUser: RequestI = {
    type: 'update_room',
    data: JSON.stringify(arr),
    id: 0,
  };
  wss.clients.forEach((e) => {
    e.send(JSON.stringify(sendUser));
  });
};

const addUserToRoom = async (json: string, clientId: string) => {
  const { indexRoom } = JSON.parse(json);
  const room = availableRoomArr.find((roomId) => roomId.roomId === indexRoom);
  const current = createdUsers.find((user) => user.id === clientId);

  if (current && room) {
    const user = room.roomUsers.find((user) => user.index === current.id);

    if (!user) {
      // console.log(current);
      const { name, id } = current;
      room.roomUsers.push({ name: name, index: id });
      // console.log(availableRoomArr);
    }
    if (roomInGame.length === 1) {
      return;
    } else {
      roomInGame.push(room);
      const index = availableRoomArr.indexOf(room);
      availableRoomArr.slice(index, 0);
    }
  }
};

const createGame = async (
  gameRoom: UpdateRoomI[],
  clientsMap: Map<string | number, WebSocket>,
) => {
  gameRoom.map((elem) => {
    if (elem.roomUsers.length !== 1) {
      elem.roomUsers.forEach((room) => {
        const ws = clientsMap.get(room.index);
        const sendUser: RequestI = {
          type: 'create_game',
          data: JSON.stringify({
            idGame: elem.roomId,
            idPlayer: room.index,
          }),
          id: 0,
        };
        ws?.send(JSON.stringify(sendUser));
      });
    }
  });
};
