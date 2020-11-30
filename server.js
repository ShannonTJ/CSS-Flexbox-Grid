const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 3000;
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//Handle a socket connection request from web client
const connections = [null, null];

io.on("connection", (socket) => {
  //   console.log("New WS connection");

  //Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] == null) {
      playerIndex = i;
      break;
    }
  }

  //Tell the connecting client what player number they are
  socket.emit("player-number", playerIndex);
  console.log(`Player ${playerIndex} has connected`);

  //Ignore player 3
  if (playerIndex === -1) return;

  connections[playerIndex] = false;

  //Tell everyone else what player number just connected
  socket.broadcast.emit("player-connection", playerIndex);

  //Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`Player ${playerIndex} has disconnected`);
    connections[playerIndex] = null;
    //Tell everyone what player number just disconnected
    socket.broadcast.emit("player-connection", playerIndex);
  });

  //When player is ready
  socket.on("player-ready", () => {
    socket.broadcast.emit("enemy-ready", playerIndex); //broadcast to other players that an enemy is ready and the enemy's player index
    connections[playerIndex] = true;
  });

  //Check player connections
  socket.on("check-players", () => {
    const players = [];
    //Loop through connections
    for (const i in connections) {
      connections[i] == null
        ? players.push({ connected: false, ready: false })
        : players.push({ connected: true, ready: connections[i] }); //get ready status from the actual connection
    }
    socket.emit("check-players", players);
  });

  //On shot fired
  socket.on("fire", (id) => {
    console.log(`Shot fired from ${playerIndex}`, id);

    //Emit the move to the other player
    socket.broadcast.emit("fire", id);
  });

  //On shot reply
  socket.on("fire-reply", (square) => {
    console.log(square);

    //Forward the reply to the other player
    socket.broadcast.emit("fire-reply", square);
  });
});
