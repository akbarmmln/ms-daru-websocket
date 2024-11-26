'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const socket = require('./api/v1/socket/controller');
const WebSocket = require('ws');

const PORT_WS = process.env.PORT_WS

const clients = new Map();
const wss = new WebSocket.Server({ host: '0.0.0.0', port: PORT_WS }, () => {
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
            console.log('clientsclients', JSON.stringify(clients))
            
            const targetWs = clients.get(data.targetClientId);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(JSON.stringify({ from: clientId, payload: data.payload }));
            } else {
                logger.infoWithContext(`Target client ${data.targetClientId} not found`);
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

const PORT = process.env.PORT
const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));

module.exports = server;