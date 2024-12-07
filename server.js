'use strict';
require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./config/logger');
const socket = require('./api/v1/socket/controller');
const WebSocket = require('ws');
// const clients = require('./config/clients');
const redisClient = require('./config/redis');

const CLIENTS_KEY = 'websocket_clients';

// const PORT_WS = process.env.PORT_WS
const PORT = process.env.PORT

// const wss = new WebSocket.Server({ host: '0.0.0.0', port: PORT_WS }, () => {
//     logger.infoWithContext(`WebSocket server running on ws://localhost:${PORT_WS}`);
// });
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    let clientId;

    // Handle registration and plush message
    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            clientId = data.clientId;
            // clients.set(clientId, ws);
            await redisClient.hset(CLIENTS_KEY, clientId, JSON.stringify({ clientId, connectedAt: Date.now(), connectDetails: ws }));
            await socket.createClient(clientId);
            logger.infoWithContext(`Registered client: ${clientId}`);
        } else if (data.type === 'message') {
            // const targetWs = clients.get(data.targetClientId);
            const targetClient = await redisClient.hget(CLIENTS_KEY, data.targetClientId);
            const messageSend = {
                from: clientId,
                payload: data.payload
            }
            if (targetClient) {
                const targetWs = JSON.parse(targetClient);                
                if (targetWs && targetWs.connectDetails['_readyState'] === WebSocket.OPEN) {
                    logger.infoWithContext(`public message with targeted client id ${data.targetClientId}`);
                    targetClient.send(JSON.stringify(messageSend));
                } else if (targetWs && targetWs.connectDetails['_readyState'] === WebSocket.CLOSED) {
                    logger.infoWithContext(`public message with targeted client id ${data.targetClientId} not send, with payload ${JSON.stringify(messageSend)}. Connection not open`);
                } else {
                    logger.infoWithContext(`public message: ${JSON.stringify(messageSend)}`);
                }
            }
            // if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            //     logger.infoWithContext(`public message with targeted client id ${data.targetClientId}`);
            //     targetWs.send(JSON.stringify(messageSend));
            // } else if (targetWs && targetWs.readyState === WebSocket.CLOSED) {
            //     logger.infoWithContext(`public message with targeted client id ${data.targetClientId} not send, with payload ${JSON.stringify(messageSend)}. Connection not open`);
            // } else {
            //     logger.infoWithContext(`public message: ${JSON.stringify(messageSend)}`);
            // }
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
            // await redisClient.hdel(CLIENTS_KEY, clientId);
            await redisClient.hset(CLIENTS_KEY, clientId, JSON.stringify({ clientId, connectedAt: Date.now(), connectDetails: ws }));
            await socket.deleteClient(clientId)
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
    const clients = await redisClient.hgetall(CLIENTS_KEY);
    const numberOfClientConnected = Object.entries(clients)
    logger.infoWithContext(`Number of connected clients: ${numberOfClientConnected.length}`)

    for (const [clientId, clientData] of Object.entries(clients)) {
        const clientInfo = JSON.parse(clientData);
        if (clientInfo) {
            if (clientInfo.connectDetails['_readyState'] === WebSocket.OPEN) {
                clientData.ping();
                logger.infoWithContext(`ping to client ${clientId} reachable`);
            } else {
                logger.infoWithContext(`ping to client ${clientId} not reachable`);
            }
        }
    }

    // logger.infoWithContext(`Number of connected clients: ${clients.size}`)
    // clients.forEach((ws, clientId) => {
    //     if (ws.readyState === WebSocket.OPEN) {
    //         ws.ping();
    //         logger.infoWithContext(`ping to client ${clientId} reachable`);
    //     } else {
    //         logger.infoWithContext(`ping to client ${clientId} not reachable`);
    //     }
    // });
}, 30000);

// const server = app.listen(PORT, () => logger.infoWithContext(`API Server started. Listening on port:${PORT}`));
server.listen(PORT, () => logger.infoWithContext(`Server (HTTP + WebSocket) started. Listening on port:${PORT}`));

module.exports = server;