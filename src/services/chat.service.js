const query = require('../utils/mysql');

const createMessage = async (values) => {
  const { to, message, from } = values;

  const newMessage = await query(`INSERT INTO chats(from_user, to_user, message) VALUES ('${from}','${to}','${message}')`);

  return newMessage;
};

const getMessages = async (values) => {
  const { sender, receiver } = values;
  const data = await query(
    `SELECT * FROM chats WHERE (from_user='${sender}' AND to_user='${receiver}') OR (from_user='${receiver}' AND to_user='${sender}')`
  );
  return data;
};

module.exports = {
  createMessage,
  getMessages,
};
