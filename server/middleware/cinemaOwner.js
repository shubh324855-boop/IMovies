
module.exports = function cinemaOwner(req, res, next) {
  if (
    !req.user ||
    !['cinema_owner', 'platform_admin'].includes(req.user.role)
  ) {
    return res.status(403).json({
      message: 'Cinema owner access required.'
    });
  }

  next();
};
