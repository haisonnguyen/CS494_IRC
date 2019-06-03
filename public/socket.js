
var room = '<button id="create-room-btn" class="btn-primary btn-group-vertical">name</button>';
var current = "main";

$(document).ready(() => {
  console.log("Ready");
  var socket = io();

  $("#create-room-submit").on("click", () => {
    createRoom();
  });
  
  $("#chat-room-name").keypress(e => {
    var key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") createRoom();
  });
  
 
  $('#chat-message-form').submit(function (e) {
    e.preventDefault();
    var message = $("#chat-message-input").val();
    $("#chat-message-input").val("");
    socket.emit("chat message", { room: current, msg: message });
    return false;
  });

  socket.on("chat message", data => {
    $("#messages").append($("<li class='message list-group-item'>").text(data.msg));
    $("#messages").animate({scrollTop: $("#messages").prop("scrollHeight") });

  });

  socket.on("user join", user => {
    $("#messages").append($("<li class='message list-group-item'>").text(user.toString() + " has joined!"));
    //$("#online-users").append($("<li>").text(user.toString()));
  });

/*
  



  socket.on("user left", user => {
    $("#chats #main").append($("<li>").text(user.toString() + " has left!"));
  });
  

  function switchRooms(older, newer) {
    socket.emit("switch rooms", { old: older, newer: newer });
  }
  */
  function createRoom() {
    var room_name = $('#chat-room-name').val();
    $('#chat-room-name').val("");
    var temp_room = room.replace("btn-primary","btn-light").replace("name",room_name);
    $('#group-chat-list').append($('<li>').html(temp_room));
  }
});




/*


$(document).ready(() => {
  // Start
  

  
});

*/