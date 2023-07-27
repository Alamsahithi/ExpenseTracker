const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateToken = ({ id, fullName, email, phone, premiumUser }) => {
  return jwt.sign(
    { id, fullName, email, phone, premiumUser },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

//@desc Register user
//route POST /user/signup
//access public
const userSignup = async (req, res) => {
  const { fullName, email, password, phone } = req.body;
  try {
    if (!fullName || !email || !password || !phone) {
      return res.status(500).json({
        status: false,
        data: null,
        message: "Please fill all the required fields",
      });
    } else {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(409)
          .json({ status: false, data: null, message: "User already exits" });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
          fullName,
          email,
          password: hashedPassword,
          phone,
          premiumUser: false,
          totalExpenses: 0,
        });
        if (user) {
          return res.status(201).json({
            status: true,
            message: "User created successfully",
          });
        } else {
          return res.status(400).json({
            status: false,
            data: null,
            message: "Internal server error",
          });
        }
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

//@desc Authenticate user
//route POST /user/signin
//access public
const userSignin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email && password) {
      const user = await User.findOne({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const { id, fullName, email, phone, premiumUser } = user;
        res.status(201).json({
          status: true,
          token: generateToken(user),
          data: { user: { id, fullName, email, phone, premiumUser } },
          message: "Logged in successfully",
        });
      } else {
        res
          .status(400)
          .json({ status: false, data: null, message: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing email or password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Server error",
    });
  }
};

//@desc get user details
//@route GET /user/profile
//access private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req?.user?.id);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Server error",
    });
  }
};

//@desc edit user details
//@route POST /user/editProfile
//access private
const editUserProfile = async (req, res) => {
  const { phone } = req.body;
  try {
    if (phone) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        const updatedUser = await user.update(req.body);
        if (updatedUser) {
          const { id, fullName, email, phone, profilePic } = updatedUser;
          return res.status(200).json({
            status: true,
            user: { id, fullName, email, phone, profilePic },
            message: "User details updated successfully",
          });
        } else {
          return res.status(400).json({
            status: false,
            data: null,
            message: "Something went wrong",
          });
        }
      } else {
        return res.status(400).json({ message: "User not found" });
      }
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Phone number missing",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Server error",
    });
  }
};

module.exports = {
  userSignup,
  userSignin,
  getUserProfile,
  editUserProfile,
};
