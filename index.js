const express = require('express');
const { createServer } = require('http');
const { yWebSocketHandler } = require('y-websocket');
const Y = require('yjs');

// Create an Express app
const app = express();
const server = createServer(app);

// Set up a Y.js WebSocket handler
const ydoc = new Y.Doc();
const yWebsocket = yWebSocketHandler(ydoc);

// Bind the Y.js WebSocket handler to the server
yWebsocket.bindToServer(server);

// Define a shared Y.Text
const ytext = ydoc.getText('myText');

// Set up event listener for Yjs changes
ytext.observe(event => {
  console.log('Yjs change:', event);
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
