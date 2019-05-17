// Setup for basic express server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);


const port = process.env.PORT || 8080;

const INDEX = "./index.html"

var numUsers = 0;
var onlineUsers = {};

/******************************************************** App Routing ********************************************************/
// Serving static files under 'public'
app.use(express.static(__dirname + "/public"));

// ******************************************************** Socket handling ********************************************************/
// Socket Event handling for chat messaging
io.on("connection", (socket) => {
  // Upon a connection, announce arrival
  io.emit("user join", socket.id);

  // Sending messages
  socket.on("chat message", msg => io.emit("chat message", msg));

  // Upon disconnect, announce departure
  socket.on("disconnect", () => {
    io.emit("user left", socket.id);
  });
});

/******************************************************** Server ********************************************************/
// Listen on port
server.listen(port, () => {
  console.log("Listening on port " + port);
});
