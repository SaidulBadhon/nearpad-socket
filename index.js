const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("y-websocket");
const Y = require("yjs");

// Create an Express app
const app = express();
const server = createServer(app);

// Set up a WebSocket server
const yWebSocketServer = new WebSocketServer({ server });

// Create a Yjs instance
const ydoc = new Y.Doc();
yWebSocketServer.bindToExpress(app);

// Define a shared Y.Text
const ytext = ydoc.getText("myText");

// Set up event listener for Yjs changes
ytext.observe((event) => {
  console.log("Yjs change:", event);
});

// Start the server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// const http = require('http');
// const PORT = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World!');
// });

// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });
