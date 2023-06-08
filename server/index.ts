const port = 9090;
import {Server, Socket} from "socket.io"
let io = new Server({
    cors : {
        origin: "http://localhost:3000"
    }
})
const server = io.listen(port);
interface Rooms {
    [roomId: string]: string[];
}
interface SignalDataInterface {
  room : string;
  answer ?: any;
  candidate ?: any;
  offer ?: any
}

const rooms: Rooms = {};

io.on('connection', (socket: Socket) => {
  console.log('User connected');

  socket.on('join-room', (roomId: string) => {
    console.log('join-room',roomId, socket.id);

    if (rooms[roomId]) {
      rooms[roomId].push(socket.id);
      // If there are two clients in the room, notify both of them
      if (rooms[roomId].length === 2) {
        console.log('emit joined')
        io.to(rooms[roomId][0]).emit('joined', false); // Non-Initiator
        io.to(rooms[roomId][1]).emit('joined', true); // initiator
      }
    } else {
      rooms[roomId] = [socket.id];
    }

    socket.join(roomId);
  });

  socket.on('signal', ({room, ...rest} : SignalDataInterface) => {
    console.log('signal', {room, socketId : socket.id}, Object.keys(rest));
    socket.broadcast.to('room1').emit('signal', rest);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Here you could also handle removing the user from the rooms object
    
  });
});


