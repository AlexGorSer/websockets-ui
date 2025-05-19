import { httpServer } from './src/http_server/index';
import { StartWS } from './src/ws/index';
import 'dotenv/config';

const HTTP_PORT = process.env.HTTP_PORT ?? 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
StartWS();
httpServer.listen(HTTP_PORT);
