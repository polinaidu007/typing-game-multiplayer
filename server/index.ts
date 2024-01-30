const port = 9090;
import {Server, Socket} from "socket.io"
import { faker } from '@faker-js/faker';
require('dotenv').config();

let io = new Server({
    cors : {
        origin: process.env.UI_URL || "http://localhost:3000"
    }
})
const server = io.listen(port);
interface RoomSockets {
    [socketId: string]: Socket;
}

interface RoomParagraphMapping  {
    [roomId: string]: string;
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
const roomParagraphMap : RoomParagraphMapping   = {};

function generateRandomParagraph(minWords : number, maxWords : number) {
    // Generate a random number of words for the paragraph
    const numWords = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

    // Generate words with faker
    const words = Array.from({ length: numWords }, () => faker.word.sample());

    // Join the words to form a paragraph
    const paragraph = words.join(' ');

    return paragraph;
}




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

    // create paragraph for game
    // check if someone else in the room already created paragraph
    if (roomParagraphMap[socket.channel]) {
      socket.emit('paragraph-res', { paragraph: roomParagraphMap[socket.channel] })
      return;
    }
    // else generate paragraph
    let paragraph = generateRandomParagraph(70, 80);
    roomParagraphMap[socket.channel] = paragraph;
    socket.emit('paragraph-res', { paragraph });

  });

  socket.on('signal', ({ peerId, ...rest} : PeerSignalingData) => {
    console.log('signal', {socketId : socket.id}, Object.keys(rest));
    sockets[peerId].emit('signal', {peerId : socket.id, ...rest});
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (rooms && rooms?.[socket.channel] && socket.id in rooms?.[socket.channel]) {
      delete rooms[socket.channel][socket.id];
      if (Object.keys(rooms[socket.channel])?.length === 0) {
        console.log("clearing rooms and roomParagraphMap objs")
        delete rooms[socket.channel];
        delete roomParagraphMap[socket.channel];
      }
    }
    delete sockets[socket.id];
    // Here you could also handle removing the user from the rooms object
    
  });
});


