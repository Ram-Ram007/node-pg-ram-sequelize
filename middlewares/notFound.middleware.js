const notfound = (req, res, next) => {
  next({
    status: 400,
    message: "resource not found",
  });
};

module.exports = { notfound };
