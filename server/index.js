const { WebSocket, WebSocketServer } = require("ws");
const http = require("http");

const url = "wss://9f1b-136-24-109-242.ngrok-free.app/PAEaHSpkFugUBTNB/ws";
let clientConnection = null;
const LOON_STATE_TOPIC = "loonState";

// If the client websocket connection is open, send the message
//  through the websocket to the client.
const broadcastMessage = (json) => {
  if (clientConnection && clientConnection.readyState === WebSocket.OPEN) {
    clientConnection.send(json); // The data is already stringified
  }
};

// Open a websocket connection to the external websocket server (wss link)
// On initial connection, subscribe to the msg topic
const ws = new WebSocket(url);
ws.on("open", function () {
  ws.on("error", console.error);

  ws.send(JSON.stringify({ subscribe: "msg" }));
});

// When a message is received, broadcast the message through the
//  client websocket connection.
ws.on("message", function (data, flags) {
  const message = flags.isBinary ? data : data.toString();
  broadcastMessage(message);
});

// Init http server and WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});

// Event types
const eventTypes = {
  START_GAME: "start_game",
  POP_LOON: "pop_loon",
};

const handleMessage = (data, isBinary) => {
  const message = isBinary ? data : data.toString();
  const dataFromClient = JSON.parse(message);

  if (dataFromClient.type === eventTypes.START_GAME) {
    ws.send(JSON.stringify({ subscribe: LOON_STATE_TOPIC }));
  } else if (dataFromClient.type === eventTypes.POP_LOON) {
    ws.send(
      JSON.stringify({
        publish: {
          popLoon: {
            loonId: dataFromClient.data,
          },
        },
      })
    );
  } else if (dataFromClient.type === "test") {
    console.log("testing!");
  }
};

// When the client connects to this websocket connection...
wsServer.on("connection", function (connection) {
  clientConnection = connection;

  // Trigger the function that broadcasts a message thru the
  //  Loons websocket server.
  connection.on("message", handleMessage);

  // TODO: Handle connection close event
  // connection.on("close", handleDisconnect);
});
