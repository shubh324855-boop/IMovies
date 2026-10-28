
module.exports = function admin(req, res, next) {
  if (!req.user || req.user.role !== 'platform_admin') {
    return res.status(403).json({
      message: 'Platform admin access required.'
    });
  }

  next();
};
