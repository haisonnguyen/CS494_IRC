// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));
const main = "main_chat";

io.on("connection", socket => {
  io.emit("user join", socket.id);
  socket.join(main);

  socket.on("chat message", data => {
    console.log(data.room, data.msg)
    io.to(data.room).emit("chat message", data);
  });

  socket.on("switch room", (room) => {
  
    socket.join(room);
  })
  socket.on("disconnect", () => {
    io.emit("user left", socket.id);
  })
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});
