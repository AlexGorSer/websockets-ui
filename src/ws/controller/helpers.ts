import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import {
  RequestI,
  CreateLoginUserI,
  UpdateRoomI,
  UserArrI,
  ResType,
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

  const isUser = createdUsers.find((user) => user.name === name);

  if (!isUser) {
    createdUsers.push({ name, password, id });
    console.log(`User ${name} created ${id}`);

    await sendReq(
      {
        name: name,
        index: id,
        error: false,
        errorText: '',
      },
      ResType.REG,
      ws,
    );
  } else {
    if (isUser.password === password) {
      isUser.id = id;
      console.log(`User ${name} is logIn`);
      await sendReq(
        {
          name: name,
          index: id,
          error: false,
          errorText: '',
        },
        ResType.REG,
        ws,
      );
    } else {
      await sendReq(
        {
          name: '',
          index: '',
          error: true,
          errorText: 'Wrong password',
        },
        ResType.REG,
        ws,
      );
      console.log(`User ${name} wrong password`);
    }
  }
};

const createRoom = async (
  clientId: string,
  createdUsers: UserArrI[],
  availableRoomArr: UpdateRoomI[],
) => {
  const indexRoom = randomUUID();
  const current = createdUsers.find((user) => user.id === clientId);

  if (!current) {
    console.log(`User not found`);
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
  console.log(`Room ID ${indexRoom} is created`);
  availableRoomArr.push(room);
};

const UpdateRoom = async (
  wss: WebSocket.Server,
  arr: UpdateRoomI[] | UpdateRoomI,
) => {
  const sendUser: RequestI = {
    type: ResType.UPDATE_ROOM,
    data: JSON.stringify(arr),
    id: 0,
  };
  wss.clients.forEach((e) => {
    e.send(JSON.stringify(sendUser));
  });
  console.log(`Rooms list update`);
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
  const current = createdUsers.find((user) => user.id === clientId);

  if (current && room) {
    const user = room.roomUsers.find((user) => user.index === current.id);

    if (!user) {
      const { name, id } = current;
      room.roomUsers.push({ name: name, index: id });
    }

    roomInGame.push(room);
    const index = availableRoomArr.indexOf(room);
    availableRoomArr.splice(index);
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
          type: ResType.CREATE_GAME,
          data: JSON.stringify({
            idGame: elem.roomId,
            idPlayer: room.index,
          }),
          id: 0,
        };
        console.log(`Game ${elem.roomId} is created`);
        ws?.send(JSON.stringify(sendUser));
      });
    }
  });
};

const sendReq = async (data: object, typeReq: string, ws: WebSocket) => {
  const sendUser: RequestI = {
    type: typeReq,
    data: JSON.stringify(data),
    id: 0,
  };

  ws.send(JSON.stringify(sendUser));
};

export { createGame, addUserToRoom, UpdateRoom, createRoom, createPlayer };
