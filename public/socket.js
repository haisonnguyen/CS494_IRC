let current = "main";

$(document).ready(() => {
  // Establish a client connection
  let socket = io.connect('//localhost:8080',{'forceNew':true });
  console.log("Ready");

  /**
   * Jquery
   *
   * Below we cache results for performance
   */

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

  $groupChatList.on("click", "a", function () {
    switchChatWindows(this);
  });

  function switchChatWindows(room) {
    current = $(room).text();
    $('#' + current + 'Messages').siblings().hide();
    $('#' + current + 'Online').siblings().hide();
    $('#' + current + 'Messages').show();
    $('#' + current + 'Online').show();
  }
  $createRoomButton.on("click", function () {
    $createRoomModal.modal("show");
  });

  $("#createRoomSubmit").on("click", () => {
    let roomName = $chatRoomName.val();
    $chatRoomName.val("");
    socket.emit("create room", roomName);
  });

  $("#chatRoomName").keypress(e => {
    let key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") {
      let roomName = $chatRoomName.val();
      $chatRoomName.val("");
      socket.emit("create room", roomName);
      $createRoomModal.modal("hide");
    }
  });

  $chatMessageForm.on("submit", function (e) {
    e.preventDefault();
    sendMessage();
  });

  $sendMessageButton.on("click", function () {
    sendMessage();
  });

  $chatRoomList.on("click", "a > button", function () {
    switchRooms(this);
  });

  /**
   * Socket
   */

  socket.on("chat message", function (data) {
    updateMessages(data);
  });

  socket.on("user joined", function (data) {

    let user = data.socketId;
    let roomName = data.roomName;
    socket.emit("list room members", roomName);
    $("#" + roomName + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(user + " has joined!")
    );

    let tag = $("<a>")
      .addClass("list-group-item list-group-item-action")
      .attr("id", user + "OnlineBtn")
      .text(user);

    $("#" + roomName + "Online").append(tag);
  });

  socket.on("user left", function (data) {
    let user = data.socketId;
    let roomName = data.roomName;
    socket.emit("list room members", roomName);
    $("#" + roomName + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(user + " has left!")
    );

  })

  socket.on("joined room", function (data) {
    joinRoom(data.roomName);
  });

  socket.on("left room", function (data) {
    leaveRoom(data.roomName);
  });

  socket.on("created room", function (roomName) {
    createRoom(roomName);
  });

  socket.on("list room members", function (data) {
    updateOnlineUsers(data);
  });

  socket.on("err", err => console.log(err));


  function createRoom(roomName) {

    let $listGroup = $("<div>").addClass("list-group");
    /**
     * Create the room's button for active chats
     */
    let room = $("<a>")
      .addClass("list-group-item list-group-item-action list-group-room")
      .attr("id", roomName);
    let badge = $("<span>")
      .addClass("badge badge-primary rounded list-group-item-badge")
      .text(roomName);
    let btn = $("<button>")
      .addClass("btn btn-primary btn-sm rounded list-group-item-btn")
      .text("Join Room");
    room.append(badge);
    room.append(btn);
    $chatRoomList.append(room);

    /**
     * Create container for messages for specific room
     */
    $("#chatBoxList").append(
      $listGroup.clone().attr("id", roomName + "Messages")
    );
    /**
     * Create container for online users for specific room
     */
    $("#onlineList").append($listGroup.attr("id", roomName + "Online"));
  }

  function joinRoom(roomName) {
    socket.emit("list room members", roomName);
    $("#" + roomName + " > button").text("Leave Chat");
    let list_room = $("<a>")
      .addClass("list-group-item list-group-item-action list-group-room")
      .attr("id", roomName + "Btn")
      .text(roomName);
    $groupChatList.append(list_room);
  }

  function leaveRoom(roomName) {
    $("#" + roomName + " > button").text("Join Room");
    $('#' + roomName + 'Btn').remove();
    $('#' + roomName + 'Messages').hide();
    $('#' + roomName + 'Online').hide();
  }

  function switchRooms(btn) {
    let $btn = $(btn);
    let roomName = $btn.parent().attr("id");
    let state = $btn.text();

    // Leave Room 
    if (state == "Join Room") {
      socket.emit("join room", roomName);
    }
    // Join Room
    else {
      socket.emit("leave room", roomName);
    }
  }

  function sendMessage() {
    let message = $chatMessageInput.val();
    if (message) {
      $chatMessageInput.val("");
      socket.emit("chat message", { roomName: current, msg: message });
    }
  }

  function updateMessages(data) {
    let roomName = data.roomName;
    let msg = data.msg;
    $("#" + roomName + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(msg)
    );
    $("#" + roomName + "Messages").animate({
      scrollTop: $("#" + roomName + "Messages").prop("scrollHeight")
    });
  }

  function updateOnlineUsers(data) {
    $roomList = $('#' + data.roomName + 'Online');
    $roomList.empty();

    for (member of data.roomMembers) {
      let tag = $("<a>")
        .addClass("list-group-item list-group-item-action")
        .attr("id", member + "OnlineBtn")
        .text(member);
      $roomList.append(tag)
    }
  }

  function updateRoomList() {

  }

  

});
