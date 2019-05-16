// Start
$(start = () => {
  // Establish socket connection client side
  var socket = io();
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
});
