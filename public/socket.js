
let current = "main";

$(document).ready(() => {


  // Establish a client connection
  let socket = io();
  console.log("Ready");

  /**
   * Jquery
   * 
   * Below we cache results for performance
   */

  let $onlineUsers = $("#onlineUsers");
  let $messageList = $("#messageList");
  let $chatRoomName = $('#chatRoomName');
  let $chatRoomList = $("#chatRoomList");
  let $chatMessageInput = $("#chatMessageInput");
  let $chatMessageForm = $("#chatMessageForm");
  let $sendMessageButton = $('#sendMessageButton');
  let $createRoomButton = $("#createRoomButton");
  let $createRoomModal = $("#createRoomModal");
  let $groupChatList = $('#groupChatList');

  /**
   * Jquery handling events
   */
  $("*").on("mouseover", ".list-group-item", function () {
    $this = $(this);
    $this.addClass("list-group-item-dark");
    $this.css("cursor", "pointer");
  });

  $("*").on("mouseleave", ".list-group-item", function () {
    $this = $(this);
    $this.removeClass("list-group-item-dark");
    $this.css("cursor", "arrow");
  });

  $createRoomButton.on("click", function () {
    $createRoomModal.modal("show");
  });

  $("#createRoomSubmit").on("click", () => {
    createRoom();
  });

  $("#chatRoomName").keypress(e => {
    let key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") {
      createRoom();
      $createRoomModal.modal("hide");
    }

  });

  $chatMessageForm.on('submit', function (e) {
    e.preventDefault();
    sendMessage();
  });

  $sendMessageButton.on('click', function () {
    sendMessage();
  });

  $chatRoomList.on("click", "a", function (e) {
    $this = $(this);
    if ($this.hasClass("list-group-item-dark")) {
      $this.removeClass("list-group-item-dark");
    } else {
      $this.addClass("list-group-item-dark");
    }
  });

  $chatRoomList.on("click", " a button", function () {
    console.log("click");
    switchRooms(this);
  });



  /**
   * Socket 
   */
  socket.on("user join", user => {
    let name = user.toString();
    $messageList.append(
      $("<a>").addClass('message list-group-item').text(name + " has joined!")
    );
  });

  socket.on("joined main", user => {
    let room = $('<a>').addClass('list-group-item list-group-item-action list-group-room').attr('id', user)
    room.text(user);
    $onlineUsers.append(room);
  });

  socket.on("chat message", data => {
    $messageList.append(
      $("<a>").addClass('message list-group-item').text(data.msg)
    );
    $messageList.animate({
      scrollTop: $messageList.prop("scrollHeight")
    });
  });

  socket.on("joined room", function (room_name) {
    let room = $('<a>').addClass('list-group-item list-group-item-action list-group-room').attr('id', room_name + '-btn');
    $groupChatList.append(room);

  });

  socket.on("left room", function (room_name) {
    $('#' + room_name + '-btn').remove();

  });

  socket.on("err", err => console.log(err));

  function createRoom() {
    let room_name = $chatRoomName.val();
    $chatRoomName.val("");
    let room = $('<a>').addClass('list-group-item list-group-item-action list-group-room').attr('id', room_name);
    let badge = $('<span>').addClass('badge badge-primary rounded list-group-item-badge').text(room_name);
    let btn = $('<button>').addClass('btn btn-primary btn-sm rounded list-group-item-btn').text("Join Chat");
    room.append(badge);
    room.append(btn);
    $chatRoomList.append(room);
  }

  function switchRooms(btn) {
    let $btn = $(btn);
    let state = $btn.text();
    let room = $btn.parent().attr('id');

    // Leave Room
    if (state == 'Join Chat') {
      joinRoom(room);
    }
    // Join Room
    else {
      leaveRoom(room);

    }
  }

  function joinRoom(room_name) {
    $('#' + room_name + ' > button').text("Leave Chat");
    socket.emit("join room", room_name);
  }

  function leaveRoom(room_name) {
    $('#' + room_name + ' > button').text("Join Chat");
    socket.emit("leave room", room_name);
  }

  function sendMessage() {
    let message = $chatMessageInput.val();
    if (message) {
      $chatMessageInput.val("");
      socket.emit("chat message", { room: current, msg: message });
    }
  }

});