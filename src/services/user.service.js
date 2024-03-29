const httpStatus = require('http-status');
const md5 = require('md5');
const { timingSafeEqual } = require('crypto');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const query = require('../utils/mysql');
const logger = require('../config/logger');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async () => {
  const users = await query(`SELECT * FROM user`);
  return users;
};

const isSubscribed = async (userId) => {
  const users = await query('SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ? AND end_date > NOW() ', [userId]);
  return users[0].count > 0;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const users = await query(
    `
    SELECT u.user_id, u.user_name, u.user_email, u.user_mobile, u.country, u.is_admin, s.subscription_type 
    FROM user AS u 
    LEFT JOIN subscriptions AS s ON u.user_id = s.user_id 
    WHERE u.user_id = ? 
    LIMIT 1`,
    [id]
  );

  return users;
};

const getUserNameById = async (id) => {
  const users = await query(`SELECT user_name FROM user WHERE user_id = ${id} LIMIT 1`);
  return users[0];
};

const getUserByEmail = async (email) => {
  const user = await query(
    `SELECT user_id FROM user WHERE user_email = ?
    LIMIT 1`,
    [email]
  );
  return user[0];
};

const updateUserById = async (userId, updateBody, res) => {
  const { email, name, phone, country, currentPassword, newPassword, confirmNewPassword } = updateBody;

  const user = await getUserById(userId);

  if (currentPassword !== '' && newPassword !== '') {
    const OldPass = md5(currentPassword);
    if (OldPass === user[0].user_password && timingSafeEqual(Buffer.from(OldPass), Buffer.from(user[0].user_password))) {
      if (newPassword === confirmNewPassword) {
        const newMDPass = md5(newPassword);
        await query(`UPDATE user
        SET user_password='${newMDPass}'
        WHERE user_id = ${userId}`);
        res.status(200).json({ message: 'User updated' });
      } else {
        res.status(400).json({ message: 'Passwords do not match' });
      }
    } else {
      res.status(400).json({ message: 'Incorrect current password' });
    }
  } else {
    await query(`UPDATE user
        SET user_name='${name}', user_email='${email}', user_mobile='${phone}', country='${country}'
        WHERE user_id = ${userId}`);
    res.status(200).json({ message: 'User updated' });
  }
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getAllCarsCrawled = async (userId) => {
  let cars =
    await query(`SELECT DISTINCT c.id, c.img_src , c.title, c.kms_run, c.price, other_user.user_id, other_user.user_name
        FROM cars_crawled c
        JOIN user u ON c.added_by = u.user_id
        LEFT JOIN chats ch ON c.id = ch.car_crawled_id AND (ch.from_user = u.user_id OR ch.to_user = u.user_id)
        JOIN user other_user ON (
            (ch.to_user = u.user_id AND ch.from_user != u.user_id AND other_user.user_id = ch.from_user)
            OR (ch.from_user = u.user_id AND ch.to_user != u.user_id AND other_user.user_id = ch.to_user)
        )
        WHERE c.added_by = '${userId}' AND (
            ch.to_user = ${userId} OR ch.from_user = ${userId}
        )`);

  if (userId == 2074) {
    cars = await query(`
      SELECT cc.id, cc.img_src, cc.title, cc.kms_run, cc.price, ch.from_user as user_id, ch.to_user, u.user_name
      from chats ch
      LEFT JOIN cars_crawled cc ON cc.id = ch.car_crawled_id
      LEFT JOIN user u ON u.user_id = ch.from_user
      WHERE ch.to_user = 2074
      GROUP BY ch.car_crawled_id, ch.from_user;`);
  }

  return cars;
};

const initiateSubscription = async (checkoutCompletedData) => {
  const { customer, email, subscription_id } = checkoutCompletedData;

  const user = await getUserByEmail(email);
  const userId = user.user_id;

  if (!userId) {
    throw new Error(`User with email ${email} does not exist`);
  }

  const checkQuery = `SELECT * FROM subscriptions WHERE user_id = ? AND subscription_id = ? AND customer_id = ?`;
  const [subscription] = await query(checkQuery, [userId, subscription_id, customer]);

  if (subscription) {
    logger.error(`Subscription with subscription_id=${subscription_id} and customer_id=${customer} already exists`);
    response.status(400).send(`Subscription already exists`);
    return;
  }

  const iQuery = `INSERT INTO subscriptions (user_id, subscription_id, customer_id) VALUES (?, ?, ?)`;

  const initSubscription = await query(iQuery, [userId, subscription_id, customer]);

  return initSubscription;
};

const createSubscription = async (data) => {
  const { subscription_id, customer_id, amount, currency, interval, product } = data;

  // Fetch the subscription row from the subscription table
  const fetchSubscriptionQuery = `SELECT * FROM subscriptions WHERE subscription_id = ? AND customer_id = ?`;
  const [subscription] = await query(fetchSubscriptionQuery, [subscription_id, customer_id]);

  if (!subscription) {
    logger.error(`Subscription with subscription_id=${subscription_id} and customer_id=${customer_id} not found`);
    response.status(404).send(`Subscription not found`);
    return;
  }

  let subQuery;

  if (interval === 'year') {
    subQuery = `UPDATE subscriptions SET currency = ?, product = ?, subscription_type = ? , price = ?, start_date = NOW(), end_date = DATE_ADD(NOW(), INTERVAL 1 YEAR) WHERE subscription_id = ? AND customer_id = ?`;
  } else {
    subQuery = `UPDATE subscriptions SET currency = ?, product = ?, subscription_type = ? , price = ?, start_date = NOW(), end_date = DATE_ADD(NOW(), INTERVAL 1 MONTH) WHERE subscription_id = ? AND customer_id = ?`;
  }

  const result = await query(subQuery, [currency, product, interval, amount, subscription_id, customer_id]);

  if (result.affectedRows === 0) {
    logger.error(`Failed to update subscription with subscription_id=${subscription_id} and customer_id=${customer_id}`);
    response.status(500).send(`Failed to update subscription`);
    return;
  }

  return result;
};

module.exports = {
  createUser,
  createSubscription,
  initiateSubscription,
  queryUsers,
  getUserById,
  getUserNameById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getAllCarsCrawled,
  isSubscribed,
};
