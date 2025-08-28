// src/utils/response.js
exports.success = (res, message = null, status = 200) => {
  return res.status(status).json({ ok: true, message: message });
};

exports.error = (res, message = "Something went wrong", status = 400) => {
  return res.status(status).json({ ok: false, message });
};
