const https = require ('https');
const fs = require ('fs');
const express = require("express");
const { ExpressPeerServer } = require("peer");

// Security
const httpsCert= fs.readFileSync ('cert.txt');
const httpsKey= fs.readFileSync ('key.txt');
const credentials = { key: httpsKey, cert: httpsCert };
const socketOptions = { cors: { origin: '*' }, allowEIO3: true };

// App and web Servers creation.
const app = express();
const server = https.createServer(credentials, app);

const io = require("socket.io")(server, socketOptions);
const peerOptions = { debug: true }
const peerServer = ExpressPeerServer(server, peerOptions);

// Web server config.
app.use("/peerjs", peerServer);
app.use(express.static("public"));

// Socket connection listener.
io.on("connection", socket => {
	socket.on("join-room", (roomId, userId, userName) => {
	  socket.join(roomId);
	  socket.to(roomId).broadcast.emit("user-connected", userId, userName);
	  //socket.on("previousUser", userId => socket.to(roomId).broadcast.emit("user-connected", userId));
	  socket.on("newMessage", message => io.to(roomId).emit("createMessage", message, userName))
  });
});

// Ports listeners.
server.listen(8443);