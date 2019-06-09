// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

var onlineUsers = {};
var numUsers = 0;

app.use(express.static(__dirname + "/public"));
const main = "main";

io.on("connection", socket => {
  ++numUsers;
  onlineUsers[socket.id] = socket;

  socket.on("list rooms", () => {
    var rooms = [];
    for (var k of Object.keys(socket.rooms)) {
      rooms.push(socket.rooms[k]);
    }
    socket.emit("list rooms", { rooms: rooms });
  });

  socket.on("join room", room_name => {
    var found = searchRoom(socket, room_name);
    if (!found) {
      socket.join(room_name);

      let message = socket.id+" has joined!";
      io.in(room_name).emit("user joined", {socketId:socket.id, room_name:room_name});
      socket.emit("joined room", {socketId: socket.id, room_name:room_name});
    } 
    else socket.emit("err", "You're already in this room");
  });

  socket.on("leave room", room_name => {
    var found = searchRoom(socket, room_name);

    if (found) {
      socket.emit("left room", {socketId: socket.id, room_name: room_name});
      socket.leave(room_name);
    } else socket.emit("err", "You are not in this room");
  });

  socket.on("list room members", room_name => {
    roomMembers = [];
    for (var key of Object.keys(onlineUsers)) {
      for (room of Object.keys(onlineUsers[key].rooms)) {
        if (room == room_name) roomMembers.push(key);
      }
    }
    socket.emit("list room members", roomMembers);
  });

  socket.on("create room", room_name => {
    io.emit("created room", room_name);
  });

  socket.on("chat message", data => {
    io.in(data.room_name).emit("chat message", data);
  });


  socket.on("private chat message", data => {
    io.sockets.socket(data.reciever).emit("private chat message", data.msg);
  });

  socket.on("disconnect", () => {
    io.emit("user left", socket.id);
    socket.disconnect();
  });
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});

function searchRoom(socket, room_name) {
  for (var room of Object.keys(onlineUsers[socket.id].rooms)) {
    if (room == room_name) {
      return true;
    }
  }
  return false;
}
