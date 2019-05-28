var current = "main";

$(document).ready(() => {
  // Start
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault();
    var message = $("#m").val();
    socket.emit("chat message", { room: current, msg: message });
    $("#m").val("");
    return false;
  });

  $("#create-room").on("click", () => {
    $("#create-chat-room-name").show();
  });

  $(".tab").on("click", ".tab-links", e => {
    var id = e.target.id;
    if (id != "create-room") {
      current = id;
      socket.emit("join room", current);
    }
  });

  $("#enter-chat-room-name").on("click", () => {
    createRoom();
  });

  $("#chat-room-name").keypress(e => {
    var key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") createRoom();
  });

  socket.on("chat message", data => {
    console.log(current, data.room, data.msg);
    $("#chats #" + data.room).append($("<li>").text(data.msg));
  });

  socket.on("user join", user => {
    $("#chats #main").append($("<li>").text(user.toString() + " has joined!"));
    $("#online-users").append($("<li>").text(user.toString()));
  });

  socket.on("user left", user => {
    $("#chats #main").append($("<li>").text(user.toString() + " has left!"));
  });

  function switchRooms(older, newer) {
    socket.emit("switch rooms", { old: older, newer: newer });
  }

  function createRoom() {
    var room_name = $("#chat-room-name").val();
    $("#chat-room-name").val("");
    socket.emit("create room", room_name);
    $("#create-chat-room-name").hide();
    $(
      $('<button class="tab-links" id="' + room_name + '">')
        .text(room_name)
        .insertBefore($("div button:last-child"))
    );
    $("#chats").append($('<ul class="messages" id="' + room_name + '"></ul>'));
  };
});

