"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const port = 9090;
const socket_io_1 = require("socket.io");
let io = new socket_io_1.Server({
    cors: {
        origin: "http://localhost:3000"
    }
});
const server = io.listen(port);
const rooms = {};
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('join-room', (roomId) => {
        console.log('join-room', roomId, socket.id);
        if (rooms[roomId]) {
            rooms[roomId].push(socket.id);
            // If there are two clients in the room, notify both of them
            if (rooms[roomId].length === 2) {
                console.log('emit joined');
                io.to(rooms[roomId][0]).emit('joined', false); // Non-Initiator
                io.to(rooms[roomId][1]).emit('joined', true); // initiator
            }
        }
        else {
            rooms[roomId] = [socket.id];
        }
        socket.join(roomId);
    });
    socket.on('signal', (_a) => {
        var { room } = _a, rest = __rest(_a, ["room"]);
        console.log('signal', { room, socketId: socket.id }, Object.keys(rest));
        socket.broadcast.to('room1').emit('signal', rest);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Here you could also handle removing the user from the rooms object
    });
});
