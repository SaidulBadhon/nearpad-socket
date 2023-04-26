// Import necessary modules
const express = require("express");
const http = require("http");
// const socketIO = require("socket.io");
const io = require("socket.io")(8900, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");

const app = express(); // Create an express app
app.use(cors());

const server = http.createServer(app); // Create an http server using the express app

const users = new Map(); // Map to store users with socket IDs as keys
const channels = new Map(); // Map to store channels with connected users as values

// Listen for socket connection event
io.on("connection", (socket) => {
  console.log("A user connected");

  // Socket.IO disconnect event
  socket.on("disconnect", () => {
    // Remove user from connected users and channels when disconnected
    if (users.has(socket.id)) {
      const user = users.get(socket.id);
      users.delete(socket.id);
      const channel = user.channel;
      if (channels.has(channel)) {
        const channelUsers = channels.get(channel);
        channelUsers.delete(socket.id);
        channels.set(channel, channelUsers);
        // Emit updated member list to all clients in the channel
        io.to(channel).emit("memberList", Array.from(channelUsers.values()));
        console.log(`User ${user.fullName} left channel ${channel}`);
      }
    }
    console.log("A user disconnected");
  });

  // Socket.IO event for joining a channel with user object
  socket.on("joinChannel", (channel, user) => {
    socket.join(channel); // Join the specified channel
    socket.user = user; // Set the user object as a property of the socket object
    users.set(socket.id, user); // Store user with socket ID as key in the users map
    user.channel = channel; // Store the channel information in the user object
    if (!channels.has(channel)) {
      channels.set(channel, new Map());
    }
    const channelUsers = channels.get(channel);
    channelUsers.set(socket.id, user); // Store user with socket ID as key in the channelUsers map
    channels.set(channel, channelUsers);
    // Emit updated member list to all clients in the channel
    io.to(channel).emit("memberList", Array.from(channelUsers.values()));
    console.log(`User ${user.fullName} joined channel "${channel}"`);
  });

  // Socket.IO event for leaving a channel
  socket.on("leaveChannel", (channel) => {
    socket.leave(channel); // Leave the specified channel
    const user = users.get(socket.id);
    if (channels.has(channel) && user) {
      const channelUsers = channels.get(channel);
      channelUsers.delete(socket.id);
      channels.set(channel, channelUsers);
      // Emit updated member list to all clients in the channel
      io.to(channel).emit("memberList", Array.from(channelUsers.values()));
      console.log(`User ${user.fullName} left channel ${channel}`);
    }
  });

  // Socket.IO event for sending codes
  socket.on("code", (channel, code) => {
    io.to(channel).emit("code", socket.user, code); // Emit the 'newCode' event to all clients in the channel along with the user object
    console.log(
      `User ${socket.user.fullName} sent a code in channel ${channel}: ${code}`
    );
  });

  //
  // console.log("Client connected:", socket.id);
  // users[socket.id] = {}; //Create Users - 유저를 생성함
  // users[socket.id].user = socket.user = "user" + conId; //set username - 이름 설정
  // users[socket.id].admin = socket.admin = false; //set admin - 처음 연결한 사람(주인) 여부
  // users[socket.id].color = socket.color = colors[conId % colors.length]; //set highight colors - 하이라이트 색
  // conId++; //UserId increment - 연결된 사람을 1 더한다
  // console.log("[Socket.IO]  + nsp +  : Connect " + socket.id); //print connect - 연결됐다고 알림
  // if (server?.sockets?.length == 1) {
  //   //if First Connect Client - 처음 연결 여부 (server.sockets는 연결된 클라이언트들이다.)
  //   socket.emit("admin"); //alert Admin - 주인이라고 알려줌
  //   socket.admin = true;
  //   // import file data from database - 여기서 파일 내용을 들고옴. (DB또는 다른 곳))
  //   // socket.emit('resetdata', data) - 들고온 파일의 내용을 socket.emit으로 보냄
  // } else {
  //   socket.emit("userdata", Object.values(users));
  // } //send connected Users list
  // socket.broadcast.emit("connected", {
  //   user: socket.user,
  //   color: socket.color,
  // }); //Alert New Connect - Returms the current user
  // socket.on("selection", function (data) {
  //   //Content Select Or Cursor Change Event
  //   data.color = socket.color;
  //   data.user = socket.user;
  //   socket.broadcast.emit("selection", data);
  // });
  // socket.on("filedata", function (data) {
  //   //File Data Event - 파일 내용을 알려주면
  //   socket.broadcast.emit("resetdata", data); //Give File Data - 다른 사람에게 전함
  // });
  // socket.on("disconnect", function (data) {
  //   //Client Disconnected
  //   console.log("[Socket.IO]  + nsp +  : disconnect " + socket.id); //print disconnect
  //   socket.broadcast.emit("exit", users[socket.id].user); //Alert Exit Connect
  //   socket.broadcast.emit("getUsers", Object.values(users));
  //   delete users[socket.id]; //delete from Server
  // });
  // socket.on("key", (data) => {
  //   //Change Content Event
  //   data.user = socket.user;
  //   console.log(data);
  //   socket.broadcast.emit("key", data);
  //   socket.broadcast.emit("getUsers", Object.values(users));
  // });
  // socket.broadcast.emit("getUsers", Object.values(users));

  // VARY OLD COODE
  // console.log("Client connected:", socket.id);
  // addUser(socket.id, colors[conId % colors.length]);
  // console.log("Client connected:", socket.id);
  // if (server?.sockets?.length == 1) {
  //   socket.emit("admin");
  //   socket.admin = true;
  // } else {
  //   socket.emit("userdata", Object.values(users)); //send Connected User data
  //   socket.broadcast.emit("connected", {
  //     user: socket.user,
  //     color: socket.color,
  //   }); //Alert New Connect
  //   socket.on("selection", function (data) {
  //     //Content Select Or Cursor Change Event
  //     data.color = socket.color;
  //     data.user = socket.user;
  //     socket.broadcast.emit("selection", data);
  //   });
  //   socket.on("filedata", function (data) {
  //     //File Data Event
  //     socket.broadcast.emit("resetdata", data); //Give File Data
  //   });
  //   socket.on("disconnect", function (data) {
  //     //Client Disconnected
  //     console.log("[Socket.IO] : disConnect " + socket.id); //print disconnect
  //     socket.broadcast.emit("exit", users[socket.id]?.user); //Alert Exit Connect
  //     delete users[socket.id]; //delete from Server
  //   });
  //   socket.on("key", function (data) {
  //     //Change Content Event
  //     data.user = socket.user;
  //     socket.broadcast.emit("key", data);
  //   });
  // }
});

// Start the server
const port = 3000; // You can choose any port number you prefer
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// Import necessary modules
const express = require("express");
const http = require("http");
// const socketIO = require("socket.io");
const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");

const app = express(); // Create an express app
app.use(cors());

const server = http.createServer(app); // Create an http server using the express app

const users = new Map(); // Map to store users with socket IDs as keys
const channels = new Map(); // Map to store channels with connected users as values

// Listen for socket connection event
io.on("connection", (socket) => {
  console.log("A user connected");

  // Socket.IO disconnect event
  socket.on("disconnect", () => {
    // Remove user from connected users and channels when disconnected
    if (users.has(socket.id)) {
      const user = users.get(socket.id);
      users.delete(socket.id);
      const channel = user.channel;
      if (channels.has(channel)) {
        const channelUsers = channels.get(channel);
        channelUsers.delete(socket.id);
        channels.set(channel, channelUsers);
        // Emit updated member list to all clients in the channel
        io.to(channel).emit("memberList", Array.from(channelUsers.values()));
        console.log(`User ${user.fullName} left channel ${channel}`);
      }
    }
    console.log("A user disconnected");
  });

  // Socket.IO event for joining a channel with user object
  socket.on("joinChannel", (channel, user) => {
    socket.join(channel); // Join the specified channel
    socket.user = user; // Set the user object as a property of the socket object
    users.set(socket.id, user); // Store user with socket ID as key in the users map
    user.channel = channel; // Store the channel information in the user object
    if (!channels.has(channel)) {
      channels.set(channel, new Map());
    }
    const channelUsers = channels.get(channel);
    channelUsers.set(socket.id, user); // Store user with socket ID as key in the channelUsers map
    channels.set(channel, channelUsers);
    // Emit updated member list to all clients in the channel
    io.to(channel).emit("memberList", Array.from(channelUsers.values()));
    console.log(`User ${user.fullName} joined channel "${channel}"`);
  });

  // Socket.IO event for leaving a channel
  socket.on("leaveChannel", (channel) => {
    socket.leave(channel); // Leave the specified channel
    const user = users.get(socket.id);
    if (channels.has(channel) && user) {
      const channelUsers = channels.get(channel);
      channelUsers.delete(socket.id);
      channels.set(channel, channelUsers);
      // Emit updated member list to all clients in the channel
      io.to(channel).emit("memberList", Array.from(channelUsers.values()));
      console.log(`User ${user.fullName} left channel ${channel}`);
    }
  });

  // Socket.IO event for sending codes
  socket.on("code", (channel, code) => {
    io.to(channel).emit("code", socket.user, code); // Emit the 'newCode' event to all clients in the channel along with the user object
    console.log(
      `User ${socket.user.fullName} sent a code in channel ${channel}: ${code}`
    );
  });

  //
  // console.log("Client connected:", socket.id);
  // users[socket.id] = {}; //Create Users - 유저를 생성함
  // users[socket.id].user = socket.user = "user" + conId; //set username - 이름 설정
  // users[socket.id].admin = socket.admin = false; //set admin - 처음 연결한 사람(주인) 여부
  // users[socket.id].color = socket.color = colors[conId % colors.length]; //set highight colors - 하이라이트 색
  // conId++; //UserId increment - 연결된 사람을 1 더한다
  // console.log("[Socket.IO]  + nsp +  : Connect " + socket.id); //print connect - 연결됐다고 알림
  // if (server?.sockets?.length == 1) {
  //   //if First Connect Client - 처음 연결 여부 (server.sockets는 연결된 클라이언트들이다.)
  //   socket.emit("admin"); //alert Admin - 주인이라고 알려줌
  //   socket.admin = true;
  //   // import file data from database - 여기서 파일 내용을 들고옴. (DB또는 다른 곳))
  //   // socket.emit('resetdata', data) - 들고온 파일의 내용을 socket.emit으로 보냄
  // } else {
  //   socket.emit("userdata", Object.values(users));
  // } //send connected Users list
  // socket.broadcast.emit("connected", {
  //   user: socket.user,
  //   color: socket.color,
  // }); //Alert New Connect - Returms the current user
  // socket.on("selection", function (data) {
  //   //Content Select Or Cursor Change Event
  //   data.color = socket.color;
  //   data.user = socket.user;
  //   socket.broadcast.emit("selection", data);
  // });
  // socket.on("filedata", function (data) {
  //   //File Data Event - 파일 내용을 알려주면
  //   socket.broadcast.emit("resetdata", data); //Give File Data - 다른 사람에게 전함
  // });
  // socket.on("disconnect", function (data) {
  //   //Client Disconnected
  //   console.log("[Socket.IO]  + nsp +  : disconnect " + socket.id); //print disconnect
  //   socket.broadcast.emit("exit", users[socket.id].user); //Alert Exit Connect
  //   socket.broadcast.emit("getUsers", Object.values(users));
  //   delete users[socket.id]; //delete from Server
  // });
  // socket.on("key", (data) => {
  //   //Change Content Event
  //   data.user = socket.user;
  //   console.log(data);
  //   socket.broadcast.emit("key", data);
  //   socket.broadcast.emit("getUsers", Object.values(users));
  // });
  // socket.broadcast.emit("getUsers", Object.values(users));

  // VARY OLD COODE
  // console.log("Client connected:", socket.id);
  // addUser(socket.id, colors[conId % colors.length]);
  // console.log("Client connected:", socket.id);
  // if (server?.sockets?.length == 1) {
  //   socket.emit("admin");
  //   socket.admin = true;
  // } else {
  //   socket.emit("userdata", Object.values(users)); //send Connected User data
  //   socket.broadcast.emit("connected", {
  //     user: socket.user,
  //     color: socket.color,
  //   }); //Alert New Connect
  //   socket.on("selection", function (data) {
  //     //Content Select Or Cursor Change Event
  //     data.color = socket.color;
  //     data.user = socket.user;
  //     socket.broadcast.emit("selection", data);
  //   });
  //   socket.on("filedata", function (data) {
  //     //File Data Event
  //     socket.broadcast.emit("resetdata", data); //Give File Data
  //   });
  //   socket.on("disconnect", function (data) {
  //     //Client Disconnected
  //     console.log("[Socket.IO] : disConnect " + socket.id); //print disconnect
  //     socket.broadcast.emit("exit", users[socket.id]?.user); //Alert Exit Connect
  //     delete users[socket.id]; //delete from Server
  //   });
  //   socket.on("key", function (data) {
  //     //Change Content Event
  //     data.user = socket.user;
  //     socket.broadcast.emit("key", data);
  //   });
  // }
});

// Start the server
const port = 3000; // You can choose any port number you prefer
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});





// const express = require("express");
// const http = require("http");
// const WebSocket = require("ws");
// const Y = require("yjs");

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Define a shared document
// const ydoc = new Y.Doc();
// const ytext = ydoc.getText("my-text-element");

// // Broadcast updates to all connected clients
// function broadcastUpdates(event) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(event));
//     }
//   });
// }

// // Update the shared document when the user types
// ytext.observe((event) => {
//    console.log("Yjs change:", event);
//  broadcastUpdates({
//     type: "update",
//     data: {
//       text: ytext.toString(),
//       event,
//     },
//   });
// });

// // Serve the client-side code
// app.use(express.static("public"));

// // Start the server
// server.listen(3000, () => {
//   console.log(`Server started on port ${server.address().port}`);
// });
