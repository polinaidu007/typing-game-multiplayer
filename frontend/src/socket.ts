import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL : string =  'http://localhost:9090';

export const newSocket = io(URL);
// export const A = 1