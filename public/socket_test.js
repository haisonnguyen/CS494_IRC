var socket = io();

var main = "main";

var room1 = "room1";
var room2 = "room2";
var msg = "message";

socket.emit("chat message", { room: main, msg: msg });
socket.emit("list rooms");
socket.emit("list online users", { room: main });




/***** event handlers */
socket.on("joined room", room_name => {
  console.log("You have joined:", room_name);
});

socket.on("chat message", data => {
  console.log("Room:", data.room, "Message:", data.msg);
});

socket.on("list rooms", data => {
    console.log(data.rooms);
})

socket.on("list online users", data => {
  var users = data.users;
  console.log("Online Users:");
  for (var user of users) {
    console.log("user", user);
  }
});
