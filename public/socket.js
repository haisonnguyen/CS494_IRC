let current = "main";

$(document).ready(() => {
  // Establish a client connection
  let socket = io();
  socket.emit("join room", current);
  $("#mainMessages").show();
  console.log("Ready");

  /**
   * Jquery
   *
   * Below we cache results for performance
   */

  let $onlineUsers = $("#onlineUsers");
  let $messageList = $("#messageList");
  let $chatRoomName = $("#chatRoomName");
  let $chatRoomList = $("#chatRoomList");
  let $chatMessageInput = $("#chatMessageInput");
  let $chatMessageForm = $("#chatMessageForm");
  let $sendMessageButton = $("#sendMessageButton");
  let $createRoomButton = $("#createRoomButton");
  let $createRoomModal = $("#createRoomModal");
  let $groupChatList = $("#groupChatList");
  /**
   * Jquery handling events
   */

  $groupChatList.on("click", "a", function() {
    console.log("fire");
    let room_name = $(this).text();
    console.log(room_name);
    if (room_name == current) {
      console.log("current", current);
      // no op
    } else {
      console.log("not current", current);
      $("#" + current + "Online").hide();
      $("#" + current + "Messages").hide();
      $("#" + room_name + "Online").show();
      $("#" + room_name + "Messages").show();
      current = room_name;
    }
  });
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

  $createRoomButton.on("click", function() {
    $createRoomModal.modal("show");
  });

  $("#createRoomSubmit").on("click", () => {
    let room_name = $chatRoomName.val();
    $chatRoomName.val("");
    socket.emit("create room", room_name);
  });

  $("#chatRoomName").keypress(e => {
    let key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") {
      let room_name = $chatRoomName.val();
      $chatRoomName.val("");
      socket.emit("create room", room_name);
      $createRoomModal.modal("hide");
    }
  });

  $chatMessageForm.on("submit", function(e) {
    e.preventDefault();
    sendMessage();
  });

  $sendMessageButton.on("click", function() {
    sendMessage();
  });

  $chatRoomList.on("click", "a", function(e) {
    $this = $(this);
    if ($this.hasClass("list-group-item-dark")) {
      $this.removeClass("list-group-item-dark");
    } else {
      $this.addClass("list-group-item-dark");
    }
  });

  $chatRoomList.on("click", " a button", function() {
    switchRooms(this);
  });

  /**
   * Socket
   */

  socket.on("chat message", data => {
    updateMessages(data);
  });

  socket.on("user joined", function(data) {
    let user = data.socketId;
    let room_name = data.room_name;
    console.log(user, room_name);
    $("#" + room_name + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(user + " has joined!")
    );

    let tag = $("<a>")
      .addClass("list-group-item list-group-item-action")
      .attr("id", user + "-btn")
      .text(user);

      $("#" + room_name + "Online").append(tag);
  });

  socket.on("joined room", function(data) {
    let user = data.socketId;
    let room_name = data.room_name;
    console.log(user, room_name);

    let room = $("<a>")
      .addClass("list-group-item list-group-item-action list-group-room")
      .attr("id", room_name + "Btn")
      .text(room_name);
      $groupChatList.append(room);

  });

  socket.on("left room", function(data) {
    console.log(data.room_name);
    $("#" + data.room_name + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(data.socketId + " has left the room")
    );
    $("#" + data.room_name + "Btn").remove();
  });

  socket.on("created room", function(room_name) {
    console.log("creating room");
    createRoom(room_name);
  });

  socket.on("err", err => console.log(err));

  function createRoom(room_name) {
    let listGroup = $("<div>").addClass("list-group");
    /**
     * Create the badge for chatRoomList
     */
    let room = $("<a>")
      .addClass("list-group-item list-group-item-action list-group-room")
      .attr("id", room_name);
    let badge = $("<span>")
      .addClass("badge badge-primary rounded list-group-item-badge")
      .text(room_name);
    let btn = $("<button>")
      .addClass("btn btn-primary btn-sm rounded list-group-item-btn")
      .text("Join Chat");
    room.append(badge);
    room.append(btn);
    $chatRoomList.append(room);

    $("#onlineList").append(listGroup.attr("id", room_name + "Online"));

    /**
     * Create container for messages for specific room
     */
    $("#chatBoxList").append(
      listGroup.clone().attr("id", room_name + "Messages")
    );
    /**
     * Create container for online users for specific room
     */
  }

  function switchRooms(btn) {
    let $btn = $(btn);
    let room = $btn.parent().attr("id");
    let state = $btn.text();

    // Leave Room
    if (state == "Join Chat") {
      joinRoom(room);
    }
    // Join Room
    else {
      leaveRoom(room);
    }
  }

  function joinRoom(room_name) {
    $("#" + room_name + " > button").text("Leave Chat");
    socket.emit("join room", room_name);
  }

  function leaveRoom(room_name) {
    $("#" + room_name + " > button").text("Join Chat");
    $("#" + room_name + "Btn").remove();
    $("#" + room_name + "Online").remove();
    $("#" + room_name + "Messages").remove();
    socket.emit("leave room", room_name);
  }

  function sendMessage() {
    let message = $chatMessageInput.val();
    if (message) {
      $chatMessageInput.val("");
      socket.emit("chat message", { room_name: current, msg: message });
    }
  }

  function updateMessages(data) {
    console.log("message fired");
    let room_name = data.room_name;
    let msg = data.msg;
    $("#" + room_name + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(data.msg)
    );
    $("#" + room_name + "Messages").animate({
      scrollTop: $("#" + room_name + "Messages").prop("scrollHeight")
    });
  }
});
