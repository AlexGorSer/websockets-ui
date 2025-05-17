import WebSocket from 'ws';

const connections: WebSocket[] = [];

export const StartWS = () => {
  const ws = new WebSocket.Server({ port: 3000 });

  ws.on('connection', (ws) => {
    console.log('Client connected');
    connections.push(ws);
    console.log(connections);
    ws.on('message', (message) => {
      console.log('Received message:', message);
    });

    const test = {
      type: 'reg',
      data: JSON.stringify({
        name: '1wd',
        index: 0,
        error: false,
        errorText: '',
      }),
      id: 0,
    };
    ws.send(JSON.stringify(test));
  });
};
