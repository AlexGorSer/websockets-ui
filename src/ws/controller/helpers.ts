import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import {
  RequestI,
  CreateLoginUserI,
  UpdateRoomI,
  UserArrI,
} from '../types/types';

const createPlayer = async (
  Json: RequestI,
  ws: WebSocket,
  clientId: string,
  createdUsers: UserArrI[],
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

const createRoom = async (
  clientId: string,
  createdUsers: UserArrI[],
  availableRoomArr: UpdateRoomI[],
) => {
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

const addUserToRoom = async (
  json: string,
  clientId: string,
  createdUsers: UserArrI[],
  availableRoomArr: UpdateRoomI[],
  roomInGame: UpdateRoomI[],
) => {
  const { indexRoom } = JSON.parse(json);
  const room = availableRoomArr.find((roomId) => roomId.roomId === indexRoom);
  console.log(clientId);
  const current = createdUsers.find((user) => user.id === clientId);
  console.log(current);

  if (current && room) {
    const user = room.roomUsers.find((user) => user.index === current.id);

    if (!user) {
      // console.log(current);
      const { name, id } = current;
      room.roomUsers.push({ name: name, index: id });
      // console.log(availableRoomArr);
    }

    roomInGame.push(room);
    const index = availableRoomArr.indexOf(room);
    availableRoomArr.splice(index);
    console.log(availableRoomArr);
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

export { createGame, addUserToRoom, UpdateRoom, createRoom, createPlayer };
