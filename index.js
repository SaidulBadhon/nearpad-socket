const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Y = require("yjs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define a shared document
const ydoc = new Y.Doc();
const ytext = ydoc.getText("my-text-element");

// Broadcast updates to all connected clients
function broadcastUpdates(event) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
}

// Update the shared document when the user types
ytext.observe((event) => {
  broadcastUpdates({
    type: "update",
    data: {
      text: ytext.toString(),
      event,
    },
  });
});

// Serve the client-side code
app.use(express.static("public"));

// Start the server
server.listen(3000, () => {
  console.log(`Server started on port ${server.address().port}`);
});
