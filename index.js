// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

var onlineUsers = {};

app.use(express.static(__dirname + "/public"));
const main = "main";

// Handle for when a client estbablishes a connection.
io.on("connection", socket => {
  // On connection, a client is automatically connected to "main"
  onlineUsers[socket.id] = socket;
  socket.join(main, () => console.log(socket.rooms));
  io.in(main).emit("user joined", { socketId: socket.id, roomName: main });

  /**
   * When a client wants to join a room, we make sure to check 
   * if they're not already in the room
   */
  socket.on("join room", roomName => {
    var found = searchRoom(socket, roomName);
    if (!found) {
      socket.join(roomName);
      io.in(roomName).emit("user joined", { socketId: socket.id, roomName: roomName });
      socket.emit("joined room", { socketId: socket.id, roomName: roomName });
    }
    else socket.emit("err", "You're already in this room");
  });

  /**
   * When a client wants to leave a room, we make sure to check 
   * that they're not attempting to leave a room they're
   * not currently in
   */
  socket.on("leave room", roomName => {
    var found = searchRoom(socket, roomName)
    if (found) {
      socket.leave(roomName);
      socket.emit("left room", { socketId: socket.id, roomName: roomName });
      io.in(roomName).emit("user left", { socketId: socket.id, roomName: roomName });
    }
    else socket.emit("err", "You are not in this room");
  });

  /**
   * List online members of a given room
   */
  socket.on("list room members", roomName => {
    roomMembers = [];
    for (var key of Object.keys(onlineUsers)) {
      for (room of Object.keys(onlineUsers[key].rooms)) {
        if (room == roomName) roomMembers.push(key);
      }
    }
    socket.emit("list room members", { roomName: roomName, roomMembers: roomMembers });
  });

  /*
  * Creating a room for all sockets
  */
  socket.on("create room", roomName => {
    io.emit("created room", roomName);
  });

  /**
   * If a message starts with / it must be a special command
   * We'll parse it then act on results
   */
  socket.on("chat message", data => {
    if (data.msg.startsWith("/")) {
      specialCommands(socket, data);
    }
    else {
      io.in(data.roomName).emit("chat message", data);
    }
  });

  /**
   * When creating a private message, we want to
   * notify both parties of a creating a private message
   */
  socket.on("create private message", user => {
    if(user == socket.id) {
      socket.emit("err", "Why would you want to PM yourself");
    }
    else { 
      socket.emit("created private message", user);
      io.to(user).emit("created private message", socket.id);
    }
  });

  /**
   * When sending a private message, we 
   * 1. Notify sender that we sent msg
   * 2. Notify receiver that a new msg is being sent
   */
  socket.on("send private message", (data) => {
    //  io.to(`${socketId}`).emit('hey', 'I just met you');
    let recipient = data.user;
    socket.emit("sent private message", data);
    data.user = socket.id;

    io.to(recipient).emit("new private message", data);
  });

  /*
  * When a socket disconnects, we want to properhaly handle
  * disconnect() calls close()
  */
  socket.on("disconnect", () => {
    socket.disconnect();
  });

  /**
   * If a user wants to disconnect, we
   * cycle through all rooms of the user
   * and notify those rooms that user left
   */
  socket.on("disconnecting", () => {
    for (room of Object.keys(onlineUsers[socket.id].rooms)) {
      socket.to(room).emit("user left", { socketId: socket.id, roomName: room });
    }
  });

});

server.listen(port, () => {
  console.log("Listening on port " + port);
});


/**
 * Searches a socket's rooms for a specific roomName
 * */ 

function searchRoom(socket, roomName) {
  for (var room of Object.keys(onlineUsers[socket.id].rooms)) {
    if (room == roomName) {
      return true;
    }
  }
  return false;
}

  /********************************* Helper functions*********************************/

  /**
   * A user can handle special commands:
   * 1. Multi chat room send: /send <room1,room2,...,roomx> <msg>
   * 2. Multi chat room join: /join <room1,room2,...,roomx> 
   */
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
  else if (msg.startsWith("/disconnect")) {
    socket.disconnect();
  }
}