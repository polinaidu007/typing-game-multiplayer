import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL : string =  process.env.REACT_APP_API_URL || 'http://localhost:9090';

export const newSocket = io(URL);
// export const A = 1