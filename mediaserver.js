const https = require ('https');
const fs = require ('fs');
const WebSocketServer = require ('websocket').server;
const MediaServer = require("medooze-media-server");

// Security
const httpsKey = fs.readFileSync ('key.txt');
const httpsCert= fs.readFileSync ('cert.txt');
const credentials = { key: httpsKey, cert: httpsCert };

// Create and init srv.
const serverHttps = https.createServer(credentials);
serverHttps.listen(2087);

// Getting ip from script and create Media sv endpoint.
const ip = process.argv[2];
const endpoint = MediaServer.createEndpoint(ip);

// Create socket and add request listener.
const wsServer = new WebSocketServer ({ httpServer: serverHttps, autoAcceptConnections: false });
wsServer.on('request', (request) => { 
	var protocol = request.requestedProtocols[0];
	var query = request.resourceURL.query;
	require("./lib/recording.js")(request, protocol, endpoint, query);
});

// Create an exit listener.

const onExit = (e) => {
	if (e) console.error(e);
	MediaServer.terminate();
	process.exit();
};

process.on("uncaughtException", onExit);
process.on("SIGINT", onExit);
process.on("SIGTERM", onExit);
process.on("SIGQUIT", onExit);
