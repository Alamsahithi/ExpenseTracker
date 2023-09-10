const premium = async (req, res, next) => {
  try {
    if (!req.user.premiumUser) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "You are not a premium user",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { premium };
