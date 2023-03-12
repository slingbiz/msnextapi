const httpStatus = require('http-status');
const { HttpStatusCode } = require('axios');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { myAccountService } = require('../services');

const health = catchAsync(async (req, res) => {
  const {
    headers: { cookie },
  } = req;
  res.status(200).send({ msg: 'All Good', sessionData: req.session, cookie });
});

const getMyCarListings = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // if (!req.phpSession?.user_id) {
  //   next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  // }
  const result = await myAccountService.getMyCarListings(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.send(result);
});

const getMyLeadListings = catchAsync(async (req, res) => {
  const result = await myAccountService.getMyLeadListings(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.send({ data: result });
});

const getMyRFQListings = catchAsync(async (req, res) => {
  const result = await myAccountService.getMyRFQListings(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.send({ data: result });
});

const updateStatus = catchAsync(async (req, res) => {
  const result = await myAccountService.updateStatus(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'No record found' });
  }
  res.status(200).json({ message: 'RFQ status updated' });
});

const addLeads = catchAsync(async (req, res) => {
  const result = await myAccountService.addLeads(req);
  if (!result) {
    res.status(HttpStatusCode.NoContent).send({ message: 'Error encountered while saving the file' });
  }
  res.status(201).json({ message: 'Leads imported successfully' });
});

module.exports = {
  health,
  getMyCarListings,
  getMyLeadListings,
  getMyRFQListings,
  updateStatus,
  addLeads,
};
