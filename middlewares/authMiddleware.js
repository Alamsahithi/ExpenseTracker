const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        //get token from headers
        token = req.headers.authorization.split(" ")[1];
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        //get user from the token
        if (user) {
          req.user = user;
          next();
        } else {
          return res
            .status(400)
            .json({ status: false, message: "User not found" });
        }
      } catch (error) {
        return res
          .status(401)
          .json({ status: false, data: null, message: "Not Authorized" });
      }
    } else {
      return res.status(401).json({
        status: false,
        data: null,
        message: "Not Authorized, no token",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { protect };
