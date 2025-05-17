interface RequestI<T> {
  type: string;
  data: T;
  id: 0;
}

interface CreateLoginUserI {
  name: string;
  password: string;
}

interface UserDataI {
  name: string;
  index: number | string;
  error?: boolean;
  errorText?: string;
}

interface UpdateWinnerI {
  name: string;
  wins: number;
}

interface AddUserToRoomI {
  indexRoom: number | string;
}

interface CreateRoomI {
  idGame: number | string;
  idPlayer: currentPlayerI;
}

interface UpdateRoomI {
  roomId: number | string;
  roomUser: [UserDataI];
}

interface AddShipsStartGameI {
  gameId: number | string;
  ships: [ShipsI];
  indexPlayer?: currentPlayerI;
  currentPlayerIndex?: currentPlayerI;
}

interface ShipsI {
  position: ShipPositionI;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface ShipPositionI {
  x: number;
  y: number;
}

interface gameAttackI {
  position: ShipPositionI;
  currentPlayer: currentPlayerI;
  status: 'miss' | 'killed' | 'shot';
}

interface randomAttackI {
  gameId: number | string;
  indexPlayer: currentPlayerI;
}

interface currentPlayerI {
  currentPlayer: number | string;
}

interface FinishI {
  winPlayer: currentPlayerI;
}

export {
  RequestI,
  CreateLoginUserI,
  UserDataI,
  UpdateWinnerI,
  AddUserToRoomI,
  CreateRoomI,
  UpdateRoomI,
  AddShipsStartGameI,
  ShipsI,
  gameAttackI,
  randomAttackI,
  FinishI,
};
