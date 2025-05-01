const successResponse = (res, data, message = 'Success') => {
    return res.status(200).json({ status: 'success', message, data });
  };
  
  const errorResponse = (res, error, status = 500) => {
    return res.status(status).json({ status: 'error', message: error });
  };
  
  module.exports = { successResponse, errorResponse };
  