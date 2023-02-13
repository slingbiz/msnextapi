const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
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
  const users = await query(`SELECT * FROM user WHERE user_id = ${id} limit 1`);
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
  const { email, name, currentPassword, newPassword, confirmNewPassword } = updateBody;

  const user = await getUserById(userId);

  if (currentPassword !== '' && newPassword !== '') {
    bcrypt.compare(currentPassword, user[0].user_password, function (err, response) {
      if (err) {
        res.status(400).send(err);
      }
      if (response) {
        if (newPassword === confirmNewPassword) {
          const password = newPassword;
          const salt = bcrypt.genSaltSync(8);
          const hashedPassword = bcrypt.hashSync(password, salt);
          const users = query(`UPDATE user 
          SET user_name='${name}', user_email='${email}' , user_password='${hashedPassword}'
          WHERE user_id = ${userId}`);
          res.status(200).send('User updated');
        }
        res.status(400).send('Passwords do not match');
      } else {
        res.status(400).send('Incorrect current password');
      }
    });
  } else {
    const users = await query(`UPDATE user 
        SET user_name='${name}', user_email='${email}'
        WHERE user_id = ${userId}`);
    res.status(200).send('User updated');
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
