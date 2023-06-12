const port = 9090;
import {Server, Socket} from "socket.io"
let io = new Server({
    cors : {
        origin: "http://localhost:3000"
    }
})
const server = io.listen(port);
interface RoomSockets {
    [socketId: string]: Socket;
}

interface MySocket extends Socket {
    channel : string;
}

interface Rooms {
    [roomId: string]: RoomSockets;
}
interface PeerSignalingData {
  peerId: string;
  answer?: RTCSessionDescriptionInit;
  candidate?: object;
  offer?: RTCSessionDescriptionInit
}

const rooms: Rooms = {};
const sockets : RoomSockets = {};


io.on('connection', (socketObj: Socket) => {
  const socket = socketObj as MySocket;
  sockets[socket.id] = socket;
  console.log('User connected');

  socket.on('join-room', (roomId: string) => {
    console.log('join-room',roomId, socket.id);

    if (roomId in socket.rooms) {
      console.log("[" + socket.id + "] ERROR: already joined in ", roomId);
      return;
    }

    if (!rooms.hasOwnProperty(roomId)) {
      rooms[roomId] = {};
    }

    for (let socketId in rooms[roomId]) {
      rooms[roomId][socketId].emit('joined', {isInitiator : false, peerId : socket.id});
      socket.emit('joined', {isInitiator : true, peerId : socketId});
    }

    rooms[roomId][socket.id] = socket;
    socket.channel = roomId;

    socket.join(roomId);
  });

  socket.on('signal', ({ peerId, ...rest} : PeerSignalingData) => {
    console.log('signal', {socketId : socket.id}, Object.keys(rest));
    sockets[peerId].emit('signal', {peerId : socket.id, ...rest});
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (rooms && rooms?.[socket.channel] && socket.id in rooms?.[socket.channel]) {
      delete rooms[socket.channel][socket.id];
    }
    delete sockets[socket.id];
    // Here you could also handle removing the user from the rooms object
    
  });
});


