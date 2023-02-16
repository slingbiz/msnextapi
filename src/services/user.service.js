const httpStatus = require('http-status');
const md5 = require('md5');
const { timingSafeEqual } = require('crypto');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const query = require('../utils/mysql');
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

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const users = await query(`SELECT * FROM user WHERE user_id = ${id} LIMIT 1`);
  return users;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
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

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
