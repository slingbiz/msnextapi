const query = require('../utils/mysql');

const createMessage = async (values) => {
  const { to, message, car, from } = values;

  const newMessage = await query(
    `INSERT INTO chats(car_crawled_id,from_user, to_user, message) VALUES (${Number(car)},${Number(from)},${Number(
      to
    )},'${message}')`
  );

  return newMessage;
};

const getMessages = async (values) => {
  const { sender, receiver, car } = values;
  const data = await query(
    `SELECT * FROM chats 
    WHERE car_crawled_id=${car} AND 
    (
      (from_user='${sender}' AND to_user='${receiver}')
       OR 
      (from_user='${receiver}' AND to_user='${sender}')
    )`
  );
  return data;
};

module.exports = {
  createMessage,
  getMessages,
};
