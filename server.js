'use strict';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./config/logger');
const socket = require('./api/v1/socket/controller');
const WebSocket = require('ws');
const clients = new Map();

// const PORT_WS = process.env.PORT_WS
const PORT = process.env.PORT

// const wss = new WebSocket.Server({ host: '0.0.0.0', port: PORT_WS }, () => {
//     logger.infoWithContext(`WebSocket server running on ws://localhost:${PORT_WS}`);
// });
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }, () => {
    logger.infoWithContext(`WebSocket server running on ws://localhost:${PORT_WS}`);
});

wss.on('connection', (ws, req) => {
    let clientId;

    // Handle registration and plush message
    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            clientId = data.clientId;
            clients.set(clientId, ws);
            await socket.createClient(clientId);
            logger.infoWithContext(`Registered client: ${clientId}`);
        } else if (data.type === 'message') {
            const targetWs = clients.get(data.targetClientId);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                logger.infoWithContext(`public message with targeted client id ${clientId}`);
                const messageSend = {
                    from: clientId,
                    payload: data.payload
                }
                targetWs.send(JSON.stringify(messageSend));
            } else {
                logger.infoWithContext(`public message: ${data.payload}`);
            }
        }
    });

    // Cleanup on disconnect
    ws.on('close', async () => {
        if (clientId) {
            clients.delete(clientId);
            await socket.deleteClient(clientId)
            logger.infoWithContext(`Disconnected client: ${clientId}`);
        }
    });
});

// const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));
server.listen(PORT, () => logger.infoWithContext(`Server (HTTP + WebSocket) started. Listening on port:${PORT}`));

module.exports = server;