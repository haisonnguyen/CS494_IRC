// Start
$(start = () => {
  // Establish socket connection client side
  var socket= io();

  // When click "send", emit chat message event and update value
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  //On a chat message event, append to the list
  socket.on('chat message', (msg) => {
    $('#messages').append($('<li>').text(msg));
  })

  // When a user enters, we announce their arrival
  socket.on('user join', (user) => {
    $('#messages').append($('<li>').text(user.toString() + " has joined!"));
  });


  // When a user leaves, we announce their departure
  socket.on('user left', (user) => {
    $('#messages').append($('<li>').text(user.toString()+ " has left!"));
  });
});
