var room ='<a class="list-group-item list-group-item-action list-group-room" id="name"><span class="badge badge-primary rounded list-group-item-badge">name</span><button class="btn btn-primary btn-sm rounded list-group-item-btn">Join Chat</button></a>';
var new_user ='<a class="list-group-item list-group-item-action list-group-user" id="name"><span class="badge badge-primary rounded list-group-item-badge">name</span><button class="btn btn-primary btn-sm rounded list-group-item-btn">Message</button></a>';

var current = "main";

$(document).ready(() => {
  console.log("Ready");
  var socket = io();

  $("*").on("mouseover", ".list-group-item", function() {
    $this = $(this);
    $this.addClass("list-group-item-dark");
    $this.css("cursor", "pointer");
  });

  $("*").on("mouseleave", ".list-group-item", function() {
    $this = $(this);
    $this.removeClass("list-group-item-dark");
    $this.css("cursor", "arrow");
  });

  $("#createRoomButton").on("click", function() {
    $("#exampleModal").modal("show");
  });

  $("#createRoomSubmit").on("click", createRoom());

  $("#chatRoomName").keypress(e => {
    var key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") createRoom();
  });

  $("#chat-message-form").submit(function(e) {
    e.preventDefault();
    var message = $("#chatMessageInput").val();
    $("#chatMessageInput").val("");
    socket.emit("chat message", { room: current, msg: message });
    return false;
  });

  $("#chatRoomList").on("click", "a", function(e) {
    $this = $(this);

    if ($this.hasClass("list-group-item-dark")) {
      $this.removeClass("list-group-item-dark");
    } else {
      $this.addClass("list-group-item-dark");
    }
  });

  socket.on("chat message", data => {
    $("#messageList").append(
      $("<a class='message list-group-item'>").text(data.msg)
    );
    $("#messageList").animate({
      scrollTop: $("#messages").prop("scrollHeight")
    });
  });

  socket.on("user join", user => {
    var name = user.toString();
    var re = new RegExp("name", "g");
    $("#messageList").append(
      $("<a class='message list-group-item'>").text(name + " has joined!")
    );
    var temp_name = new_user.replace(re, name);

    $("#onlineUsers").append(temp_name);
  });

  function createRoom() {
    var room_name = $("#chatRoomName").val();
    var re = new RegExp("name", "g");
    $("#chatRoomName").val("");
    var temp_room = room.replace(re, room_name);
    $("#chatRoomList").append(temp_room);
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
