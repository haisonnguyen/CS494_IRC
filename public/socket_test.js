
var main = "main";
var msg = "message";


/**
 * Testing section
 */

/**
 * 1. Client can connect to a server
 */
console.log("Test 1");
var socket = io();

/**
 * Client can create a room
 */
var room1 = "room1";
var room2 = "room2";

socket.emit("join room", room1);
socket.emit("join room", room2);
socket.on("join room", data => console.log("Test 2 and 4\n", "Created Room:", data));

/**
 * 3. Client can list all rooms
 */

var rooms = [room1, room2];
socket.emit("list rooms", rooms);
socket.on("list rooms", data => {
  console.log("Test 3\n", "Rooms:", data.rooms);
});


/**
 * 5. Client can leave a room
 */

socket.emit("leave room", room1);
socket.on("leave room", data => console.log("Test 5\n", data));

/**
 * 6. Client can list members in a room
 */
socket.emit("list room members", room1);
socket.on("list room members", data => console.log("Test 6\n", room1, "members:", data));

socket.on("chat message", data => {
  console.log("Room:", data.room, "Message:", data.msg);
});

/**
 * 8. Client can send messages to a room
 */

var msg = "Greetings";
socket.emit("chat message", { room: room1, msg: msg });
socket.on("chat message", data => console.log("Test 8\n", data));

/**
 * * 9. Client can join multiple (selected) rooms
 */

socket.emit("join rooms", rooms);
socket.on("join rooms", rooms => console.log("Test 9\n", rooms));

/**
 * 10. Client can send distinct messages to multiple (selected) rooms 
 */

socket.emit("chat message multiple", { rooms: rooms, msg: msg });
socket.on("chat message multiple", data => console.log("Test 10\n", data));


/**
 * 11. Client can disconnect from a server
 */
socket.emit("disconnect");

/**
 * 12. Private messaging
 */

 
//socket.emit("leave server");
//socket.on("leave server", data => console.log(data));
socket.on("list online users", data => {
  var users = data.users;
  console.log("Online Users:");
  for (var user of users) {
    console.log("user", user);
  }
});
