// Setup for basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

// Listen on port
server.listen(port, () => {
  console.log('Listening on port ' + port);
});

// Serving static files under 'public'
app.use(express.static(__dirname + '/public'));


// App Routing for landing page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


var numUsers = 0;
var activeUsers = {};


// Socket Event handling for chat messaging
io.on('connection', (socket) => {
  ++numUsers;
  activeUsers[socket.id] = numUsers;

  io.emit('user join', {
    id: socket.id
  });
  // Sending messages
  socket.on('chat message', msg => io.emit('chat message', msg));

  // Disconnect
  socket.on('disconnect', () => {
    io.emit('user left', {
      id: socket.id
    })
  });
});
