const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = async (req, res) => {
  await userService.updateUserById(req.params.userId, req.body, res);
};

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const userCarsCrawled = catchAsync(async (req, res) => {
  const result = await userService.getAllCarsCrawled(req.params.userId);
  res.status(200).send(result);
});

const createSubscription = catchAsync(async (req, res) => {
  const result = await userService.createSubscription(req);
  res.status(200).send(result);
});

module.exports = {
  createUser,
  createSubscription,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  userCarsCrawled,
  health,
};
