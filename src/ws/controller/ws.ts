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
// const currentRoom: UpdateRoomI = [];

export const wsController = async (ws: WebSocket, wss: WebSocket.Server) => {
  const clientId = randomUUID();
  clients.set(clientId, ws);

  ws.on('message', async (message) => {
    // console.log('Received message:', message.toString());
    const parseJSON: RequestI = await JSON.parse(message.toString());

    if (parseJSON.type === 'reg') {
      await createPlayer(parseJSON, ws, clientId);
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'create_room') {
      await createRoom();
      // console.log('create');
      await UpdateRoom(wss, availableRoomArr);
    }
    if (parseJSON.type === 'add_user_to_room') {
      await addUserToRoom(parseJSON.data, clientId);
      // console.log('add');
      await UpdateRoom(wss, availableRoomArr);
    }
  });

  ws.on('close', () => {
    console.log(`Dis ${clientId}`);
    clients.delete(clientId);
    console.log(clients);
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
  console.log(createdUsers);

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

const createRoom = async () => {
  const indexRoom = randomUUID();
  const room: UpdateRoomI = {
    roomId: indexRoom,
    roomUsers: [
      {
        name: createdUsers[0].name,
        index: createdUsers[0].id,
      },
    ],
  };

  availableRoomArr.push(room);
};

const UpdateRoom = async (
  wss: WebSocket.Server,
  arr: UpdateRoomI[] | UpdateRoomI,
) => {
  console.log(JSON.stringify(arr));
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
      console.log(current);
      const { name, id } = current;
      room.roomUsers.push({ name: name, index: id });
      console.log(availableRoomArr);
    }
  }
};
