const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { chatService } = require('../services');

const getChats = catchAsync(async (req, res) => {
  const result = await chatService.getMessages(req.body);
  res.send(result);
});

module.exports = {
  getChats,
};
