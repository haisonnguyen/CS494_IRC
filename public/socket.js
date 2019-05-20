// Start
$(start = () => {
  var socket = io('http://localhost:8080');
  var chatRooms = {};
  $("form").submit(function (e) {
    e.preventDefault();
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  $("#create-room").on('click', () => {
    $('#create-chat-room-name').show();
  });

  $(".tab-links").on('click', () => {
    var current = $(this).val();
    switchRooms(current);
  });

  $('#enter-chat-room-name').on('click', () => {
    var room_name = $('#chat-room-name').val();
    $('#chat-room-name').val("");
    socket.emit('create chat room', room_name);
    $('#create-chat-room-name').hide();
    $($('<button class="tab-links">').text(val)).insertBefore($('div button:last-child'));
  });

  socket.on('chat message', (msg) => {
    $('#main_chat').append($('<li>').text(msg));
  })

  socket.on('chat room created', (chat_room_name) => {
    var new_chat_room = io(chat_room_name);
    chatRooms[chat_room_name] = new_chat_room;
  });
  
  socket.on('user join', (user) => {
    $('#main_chat').append($('<li>').text(user.toString() + " has joined!"));
  });


  socket.on('user left', (user) => {
    $('#main_chat').append($('<li>').text(user.toString() + " has left!"));
  });
});


function switchRooms(room) {
  socket.emit('switch rooms', room);
}