// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

var chatRooms = {};
var onlineUsers = {};
chatRooms["main"] = "main";

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
  io.emit("user join", socket.id);
  onlineUsers[socket.id] = socket;
  socket.room = "main";
  
  socket.on("chat message", msg => socket.in(socket.room).emit("chat message", msg));

  socket.on("create chat room", (room_name) => {
    chatRooms[room_name] = room_name;
    socket.join(room_name);
    socket.emit("chat room created", room_name);
  });

  socket.on('switch rooms', (room) => {
    socket.leave(socket.room);
    socket.room = room;
  });

  socket.on("disconnect", () => {
    --numUsers;
    io.emit("user left", socket.id);
  });
});


server.listen(port, () => {
  console.log("Listening on port " + port);
});
