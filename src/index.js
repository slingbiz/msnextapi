const mysql = require('mysql');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { EVENTS } = require('./config/events');

const { createMessage } = require('./services/chat.service');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', credentials: true } });

// let server;

async function start() {
  try {
    const dbConnection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    dbConnection.connect();
    logger.info('Connected to MySql DB');
    logger.info('Sockets enabled');

    const connectedUsers = {};

    io.on(EVENTS.connection, (socket) => {
      logger.info(`user connected ${socket.id}`);

      /* Register fake user */
      socket.on(EVENTS.CLIENT.FAKE_USER, (username) => {
        if (!connectedUsers.hasOwnProperty(username)) {
          connectedUsers[username] = username;
        }

        socket.emit(EVENTS.SERVER.USERS, Object.keys(connectedUsers));
      });

      /* Register connected user */
      socket.on(EVENTS.CLIENT.REGISTER, (username) => {
        socket.username = username;
        connectedUsers[username] = socket;

        io.sockets.emit(EVENTS.SERVER.USERS, Object.keys(connectedUsers));
      });

      socket.on(EVENTS.CLIENT.PRIVATE_CHAT, (data) => {
        const { to, message, from } = data;

        if (connectedUsers.hasOwnProperty(to)) {
          createMessage(data);

          try {
            connectedUsers[to].emit(EVENTS.CLIENT.PRIVATE_CHAT, {
              sender: socket.username,
              message,
              receiver: to,
            });
          } catch (e) {
            socket.emit(EVENTS.SERVER.ERROR, { error: 'User offline' });
          }
        } else {
          socket.emit(EVENTS.SERVER.ERROR, { error: 'No user found' });
        }
      });

      socket.on('disconnect', () => {
        logger.info('user disconnected');
      });
    });

    server.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);

      // socketServer({ io });
    });
  } catch (e) {
    // TODO: Handle Exception.
  }
}

start();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
