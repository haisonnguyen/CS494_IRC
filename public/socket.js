
var room = '<button class="btn-primary btn-group-vertical active" id="name">name</button>';
var current = "main";

$(document).ready(() => {
  console.log("Ready");
  var socket = io();

  $("#createRoomSubmit").on("click", () => {
    createRoom();
  });

  $("#chatRoomName").keypress(e => {
    var key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") createRoom();
  });


  $('#chat-message-form').submit(function (e) {
    e.preventDefault();
    var message = $("#chatMessageInput").val();
    $("#chatMessageInput").val("");
    socket.emit("chat message", { room: current, msg: message });
    return false;
  });

  socket.on("chat message", data => {
    $("#messageList").append($("<a class='message list-group-item'>").text(data.msg));
    $("#messageList").animate({ scrollTop: $("#messages").prop("scrollHeight") });

  });

  socket.on("user join", user => {
    name = user.toString();
    $("#messageList").append($("<a class='message list-group-item'>").text(name + " has joined!"));
    $("#onlineUsers").append($('<a class="message list-group-item list-group-item-action" data-toggle="list" aria-controls="' + name + '">').text(name));
  });

  $('#groupChatList')
  function createRoom() {
    var room_name = $('#chatRoomName').val();
    var re = new RegExp('name', 'g');
    $('#chatRoomName').val("");
    var temp_room = room.replace("btn-primary", "btn-light").replace(re, room_name);
    console.log(temp_room);
    $('#groupChatList').append(temp_room);
  }

  /*
    
  
  
  
    socket.on("user left", user => {
      $("#chats #main").append($("<li>").text(user.toString() + " has left!"));
    });
    
  
    function switchRooms(older, newer) {
      socket.emit("switch rooms", { old: older, newer: newer });
    }
    */


});




/*


$(document).ready(() => {
  // Start



});

*/