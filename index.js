// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

var onlineUsers = {};
var rooms = {};

app.use(express.static(__dirname + "/public"));
const main = "main";

io.on("connection", socket => {
  onlineUsers[socket.id] = socket;
  socket.join(main, () => console.log(socket.rooms));
  io.in(main).emit("user joined", { socketId: socket.id, roomName: main });

  socket.on("join room", roomName => {
    var found = searchRoom(socket, roomName);
    if (!found) {
      socket.join(roomName);
      io.in(roomName).emit("user joined", { socketId: socket.id, roomName: roomName });
      socket.emit("joined room", { socketId: socket.id, roomName: roomName });
    }
    else socket.emit("err", "You're already in this room");
  });

  socket.on("leave room", roomName => {
    var found = searchRoom(socket, roomName)
    if (found) {
      socket.leave(roomName);
      socket.emit("left room", { socketId: socket.id, roomName: roomName });
      io.in(roomName).emit("user left", { socketId: socket.id, roomName: roomName });
    }
    else socket.emit("err", "You are not in this room");
  });

  socket.on("list room members", roomName => {
    roomMembers = [];
    for (var key of Object.keys(onlineUsers)) {
      for (room of Object.keys(onlineUsers[key].rooms)) {
        if (room == roomName) roomMembers.push(key);
      }
    }
    socket.emit("list room members", { roomName: roomName, roomMembers: roomMembers });
  });

  socket.on("create room", roomName => {
    io.emit("created room", roomName);
  });

  socket.on("chat message", data => {
    if (data.msg.startsWith("/")) {
      specialCommands(socket, data);
    }
    else {
      io.in(data.roomName).emit("chat message", data);

    }
  });


  socket.on("private chat message", data => {
    io.sockets.socket(data.reciever).emit("private chat message", data.msg);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
  });

  socket.on("disconnecting", () => {
    for (room of Object.keys(onlineUsers[socket.id].rooms)) {
      socket.to(room).emit("user left", { socketId: socket.id, roomName: room });
    }
  });

});

io

server.listen(port, () => {
  console.log("Listening on port " + port);
});

function searchRoom(socket, roomName) {
  for (var room of Object.keys(onlineUsers[socket.id].rooms)) {
    if (room == roomName) {
      return true;
    }
  }
  return false;
}

function specialCommands(socket, data) {
  let msg = data.msg;
  let socketId = data.socketId;
  let temp = "";
  temp = msg.slice(6);

  if (msg.startsWith("/send")) {
    let n = temp.indexOf(' ');
    data.msg = temp.slice(n);
    let rooms = temp.slice(0, n).split(',');
    for (room of rooms) {
      io.in(room).emit("chat message", { roomName: room, msg: data.msg });
    }
    console.log(rooms);

  }
  else if (msg.startsWith("/join")) {
    let rooms = temp.split(',');
    for (room of rooms) {
      let found = searchRoom(socket, room);
      if (!found) {
        socket.join(room);
        socket.emit("joined room", { socketId: data.socketId, roomName: room })
        io.in(room).emit("user joined", { socketId: socket.id, roomName: room });
      }
    }
  }
}
