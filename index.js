// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

var onlineUsers = {};
var numUsers = 0;
/**
 * Functionality Required
 * 1. Client can connect to a server /login
 * 2. Client can create a room  /create <room_name>
 * 3. Client can list all rooms /listrooms
 * 4. Client can join a room  /joinroom <room_name>
 * 5. Client can leave a room /leaveroom <room_name>
 * 6. Client can list members in a room /list <room_name>
 * 7. Multiple clients can connect to a server
 * 8. Client can send messages to a room  /send <room_name> <msg>
 * 9. Client can join multiple (selected) rooms /join list(<room_name>)
 * 10. Client can send distinct messages to multiple (selected) rooms /send list(<room_name>) msg
 * 11. Client can disconnect from a server  /disconnect
 * 12. Server can disconnect from clients
 * 13. Server can gracefully handle client crashes
 * 14. Client can handle server craches
 */
app.use(express.static(__dirname + "/public"));
const main = "main";

io.on("connection", socket => {
  ++numUsers;
  onlineUsers[socket.id] = socket;
  socket.join(main, () => {
    socket.emit("joined room", main);
  });

  io.emit("user join", socket.id);

  socket.on("list rooms", () => {
    var rooms = [];
    for(var k of Object.keys(socket.rooms)) {
      console.log(socket.rooms[k]);
      rooms.push(socket.rooms[k]);
    }
    socket.emit("list rooms", {rooms:rooms});

  })
  socket.on("list online users", data => {
    var total = [];
    for (var k of Object.keys(onlineUsers)) {
      var room = onlineUsers[k].rooms[data.room];
      if (room) {
        total.push(k);
      }
    }
    socket.emit("list online users", { users: total });
  });

  socket.on("chat message", data => {
    console.log("Chatroom: ", data.room, "Message: ", data.msg);
    io.to(data.room).emit("chat message", data);
  });

  socket.on("create room", room_name => {
    socket.join(room_name, () => {
      console.log(socket.rooms);
    });
    socket.emit("joined room", room_name);
  });

  socket.on("leave room", room_name => {
    socket.leave(room_name, () => {
      console.log(socket.rooms);
    });
    io.to(room_name).emit("chat message", { id: socket.id, room: room_name });
    socket.emit("left room", room_name);
  });

  socket.on("disconnect", () => {
    io.emit("user left", socket.id);
  });
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});
