'use strict';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./config/logger');
const moment = require('moment');
const WebSocket = require('ws');
const clients = require('./config/clients');
const redisClient = require('./config/redis');

const CLIENTS_KEY = 'websocket_clients';
const CLIENTS_HISTORY = 'websocket_clients_history';
const PORT = process.env.PORT

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    let clientId;

    // Handle registration and plush message
    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            clientId = data.clientId;
            clients.set(clientId, ws);
            await redisClient.hset(CLIENTS_KEY, clientId, JSON.stringify({ clientId, connectedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS') }));
            await redisClient.lpush(CLIENTS_HISTORY, JSON.stringify({ clientId, connectedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS') }));
            // await socket.createClient(clientId);
            logger.infoWithContext(`Registered client: ${clientId}`);
        } else if (data.type === 'message') {
            const targetWs = clients.get(data.targetClientId);
            const messageSend = {
                from: clientId,
                payload: data.payload
            }
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                logger.infoWithContext(`public message with targeted client id ${data.targetClientId}`);
                targetWs.send(JSON.stringify(messageSend));
            } else if (targetWs && targetWs.readyState === WebSocket.CLOSED) {
                logger.infoWithContext(`public message with targeted client id ${data.targetClientId} not send, with payload ${JSON.stringify(messageSend)}. Connection not open`);
            } else {
                logger.infoWithContext(`public message: ${JSON.stringify(messageSend)}`);
            }
        }
    });

    ws.on('error', (err) => {
        // Graceful handling: Close the connection to trigger reconnect logic
        logger.errorWithContext({ error: err, message: `WebSocket error for client id: ${clientId}`})
        ws.close();
    });

    // Cleanup on disconnect
    ws.on('close', async () => {
        if (clientId) {
            // clients.delete(clientId);
            await redisClient.hdel(CLIENTS_KEY, clientId);
            await redisClient.lpush(CLIENTS_HISTORY, JSON.stringify({ clientId, disConnectedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS') }));
            // await socket.deleteClient(clientId)
            logger.infoWithContext(`Disconnected client: ${clientId}, ${ws.readyState}`);
        }
    });

    // Handle ping received
    ws.on('ping', () => {
        logger.infoWithContext(`Received ping from client: ${clientId}`);
        ws.pong();
    });
});

setInterval(async () => {
    logger.infoWithContext('running checking client socket by send ping')
    logger.infoWithContext(`Number of connected clients: ${clients.size}`)
    clients.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
            logger.infoWithContext(`ping to client ${clientId} reachable`);
        } else {
            logger.infoWithContext(`ping to client ${clientId} not reachable`);
        }
    });
}, 30000);

// const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));
server.listen(PORT, () => logger.infoWithContext(`Server (HTTP + WebSocket) started. Listening on port:${PORT}`));

module.exports = server;