let current = "main";

$(document).ready(() => {
  // Establish a client connection
  let socket = io.connect("//localhost:8080", { forceNew: true });
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
  let $onlineList = $("#onlineList");
  let $privateChatList = $("#privateChatList");

  /**
   * Jquery handling events
   */

   /**
    * Entry point for when a user wants 
    * to create a private message
    */
  $onlineList.on("click", "a", function() {
    let user = $(this).text();
    if (!$privateChatList.find($('#'+user)).length)
      socket.emit("create private message", user);
  });

  /**
   * Handles switching chat windows
   * when a chat room is clicked
   */
  $groupChatList.on("click", "a", function() {
    switchChatWindows(this);
  });

  /**
   * Handles switching chat windows when
   * a private message chat is clicked
   */
  $privateChatList.on("click", "a", function() {
    switchChatWindows(this);
  });

  /**
   * Switch rooms by hiding all siblings and showing current
   */
  function switchChatWindows(room) {
    current = $(room).text();
    $("#" + current + "Messages")
      .siblings()
      .hide();
    $("#" + current + "Online")
      .siblings()
      .hide();
    $("#" + current + "Messages").show();
    $("#" + current + "Online").show();
  }

  /** 
   * Modal should hide once a room is created
   */
  $createRoomButton.on("click", function() {
    $createRoomModal.modal("show");
  });

  /**
   * When creating a room, we emit event + msg
   * to server
   */
  $("#createRoomSubmit").on("click", () => {
    let roomName = $chatRoomName.val();
    $chatRoomName.val("");
    socket.emit("create room", roomName);
  });

  /**
   * Same as directly above
   */
  $("#chatRoomName").keypress(e => {
    let key_code = e.keyCode ? e.keyCode : e.which;
    if (key_code == "13") {
      let roomName = $chatRoomName.val();
      $chatRoomName.val("");
      socket.emit("create room", roomName);
      $createRoomModal.modal("hide");
    }
  });

  /**
   * Handles sending regular messages
   */
  $chatMessageForm.on("submit", function(e) {
    e.preventDefault();
    sendMessage();
  });

  /**
   * Handles sending regular messages
   */
  $sendMessageButton.on("click", function() {
    sendMessage();
  });

  /**
   * Button on group chat for joining/leaving chat
   */
  $chatRoomList.on("click", "a > button", function() {
    switchRooms(this);
  });

  /**
   * Socket stuf~~~
   */

   /**
    * When a chat message arives,
    * update the room
    */
  socket.on("chat message", function(data) {
    updateMessages(data);
  });

  /**
   * User joined the room,
   * 1. we notify the server
   * 2. we announce arrival
   * 3. we add user to online list
   */
  socket.on("user joined", function(data) {
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
  
  /**
   * User left room so we announce their departure
   */
  socket.on("user left", function(data) {
    let user = data.socketId;
    let roomName = data.roomName;
    socket.emit("list room members", roomName);
    $("#" + roomName + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(user + " has left!")
    );
  });

  /**
   * After emitting join room to server
   * Server responds with joined room and
   * we are able to join the room
   */
  socket.on("joined room", function(data) {
    joinRoom(data.roomName);
  });

  /**
   * Emit intent to leave room
   * Server replies with left room
   * we are able to leave room
   */
  socket.on("left room", function(data) {
    leaveRoom(data.roomName);
  });
  
  /**
   * Emit even to create a room
   * server responds w/ created room
   * then create room
   */

  socket.on("created room", function(roomName) {
    createRoom(roomName);
  });

  /**
   * Emit event for creating a message,
   * we get this as a response and proceed
   * with creating a private message
   */
  socket.on("created private message", function(user) {
    createPrivateMessage(user);
  });

  /**
   * List room members of a room
   */
  socket.on("list room members", function(data) {
    updateOnlineUsers(data);
  });

  /**
   * New private message from some user
   */
  socket.on("new private message", function(data) {
    console.log(data);
    updatePrivateMessages(data);
  });

  /**
   * The message we sent was emitted 
   * to user by server
   */
  socket.on("sent private message", function(data) {
    console.log(data); 
    updatePrivateMessages(data);
  });

  /**
   * Upon disconnection, we notify all users in main
   */
  socket.on("disconnect", () => {
    $("#" + "main" + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text("You've been disconnected!")
    );
  });

  socket.on("err", err => console.log(err));


  /********************************* Helper functions*********************************/
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
    $("#" + roomName + "Btn").remove();
    $("#" + roomName + "Messages").hide();
    $("#" + roomName + "Online").hide();
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
      if ($privateChatList.find($('#'+current)).length) {
        console.log("found");
        sendPrivateMessage(current, message);
      }
      else
      {
        console.log("sending to", current);
        socket.emit("chat message", { roomName: current, msg: message });

      }
    }
  }

  function createPrivateMessage(user) {
    let $listGroup = $("<div>").addClass("list-group");
    /**
     * Create the room's button for active chats
     */
    let btn = $("<a>")
      .addClass("list-group-item list-group-item-action list-group-room")
      .attr("id", user)
      .text(user);

    $privateChatList.append(btn);
    /**
     * Create container for messages for specific room
     */
    $("#chatBoxList").append($listGroup.clone().attr("id", user + "Messages"));
    switchChatWindows(btn);
  }

  function sendPrivateMessage(user, message) {
    socket.emit("send private message", { user: user, msg: message });
  }

  

  function updatePrivateMessages(data) {
    let user = data.user;
    let msg = data.msg;

    $("#" + user + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(msg)
    );
    $("#" + user + "Messages").animate({
      scrollTop: $("#" + user + "Messages").prop("scrollHeight")
    });
  }

  function updateMessages(data) {
    let roomName = data.roomName;
    let msg = data.msg;
    $("#" + roomName + "Messages").append(
      $("<a>")
        .addClass("message list-group-item")
        .text(msg)
    );
    $("#" +roomName + "Messages").animate({
      scrollTop: $("#" + roomName + "Messages").prop("scrollHeight")
    });
  }

  function updateOnlineUsers(data) {
    $roomList = $("#" + data.roomName + "Online");
    $roomList.empty();

    for (member of data.roomMembers) {
      let tag = $("<a>")
        .addClass("list-group-item list-group-item-action")
        .attr("id", member + "OnlineBtn")
        .text(member);
      $roomList.append(tag);
    }
  }

  // do later
  function updateRoomList() {}
});
