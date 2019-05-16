const express = require("express");
const http = require("http");
const io = require("socket.io");

const app = express();
const server = http.Server(app);
const sock = io(server);

app.use(express.static("public"));

const port = process.env.PORT || 8080;

// App Routing for landing page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Socket handling connect/disconnect
sock.on("connect", socket => {
  console.log("connect " + socket.id);

  socket.on("disconnect", () => console.log("disconnect " + socket.id));
});

// Socket Event handling for chat messaging
sock.on("connection", socket => {
  socket.on("chat message", msg => sock.emit('chat message', msg));
});

// Listen on port
server.listen(port, () => {
  console.log("Listening on port " + port);
});
