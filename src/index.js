const mysql = require('mysql');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { EVENTS } = require('./config/events');

const { createMessage } = require('./services/chat.service');
const { getUserNameById } = require('./services/user.service');

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

      /* Register connected user */
      socket.on(EVENTS.CLIENT.REGISTER, async (id) => {
        const userId = Number(id);

        /** You can check phpAuth() here and put the below code in ifelse */

        const name = await getUserNameById(userId);

        socket.userId = userId; // eslint-disable-line no-param-reassign
        socket.userName = name?.user_name || 'N/A'; // eslint-disable-line no-param-reassign
        connectedUsers[userId] = socket;

        const ActiveUsers = Object.values(connectedUsers).map((user) => ({
          userId: user.userId,
          userName: user.userName,
        }));

        io.sockets.emit(EVENTS.SERVER.USERS, ActiveUsers);
      });

      /* Private Chat */
      socket.on(EVENTS.CLIENT.PRIVATE_CHAT, async (data) => {
        const { to, message, car } = data;

        await createMessage(data);

        if (Object.prototype.hasOwnProperty.call(connectedUsers, Number(to))) {
          try {
            connectedUsers[to].emit(EVENTS.CLIENT.PRIVATE_CHAT, {
              sender: socket.userId,
              message,
              car,
              receiver: to,
            });
          } catch (e) {
            socket.emit(EVENTS.SERVER.ERROR, { error: `${e} - Error` });
          }
        } else {
          socket.emit(EVENTS.SERVER.ERROR, { error: 'User offline' });
        }
      });

      /* Disconnect */
      socket.on('disconnect', () => {
        logger.info('user disconnected');
      });
    });

    server.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
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
