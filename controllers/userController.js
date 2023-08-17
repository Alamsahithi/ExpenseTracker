const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const ForgotPasswordRequests = require("../models/forgotPasswordRequestsModel");
const fs = require("fs");
const path = require("path");
const sequelize = require("../configs/databaseConfig");
const AWS = require("aws-sdk");
require("dotenv").config();

const uploadToS3 = (data, fileName) => {
  const BUCKET_NAME = process.env.AWS_S3_BUCKETNAME;
  let s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
  var params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res?.Location);
      }
    });
  });
};

const download = async (req, res) => {
  try {
    const user = await User.findByPk(req?.user?.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.premiumUser) {
      return res.status(400).json({ message: "You are not a premium user" });
    }
    const expenses = await user.getExpenses();
    if (!expenses) {
      return res
        .status(400)
        .json({ message: "Something went wrong, please try again" });
    }
    if (expenses?.length === 0) {
      return res.status(200).json({ message: "You don't have any expenses" });
    }
    const stringifiesExpenses = JSON.stringify(expenses);

    const fileName = `Expenses${user.id}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(stringifiesExpenses, fileName);
    return res.status(200).json({ fileUrl });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

//forgot password
const forgotpassword = async (req, res) => {
  const { forgotPasswordEmail } = req.body;
  try {
    if (!forgotPasswordEmail) {
      return res.status(500).json({ message: "Please send a valid email id" });
    }
    const user = await User.findOne({ where: { email: forgotPasswordEmail } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Please enter the registered email id" });
    }
    const requestId = uuidv4();
    const forgotPasswordRequest = await ForgotPasswordRequests.create({
      id: requestId,
      userId: user.id,
      isactive: true,
    });
    if (!forgotPasswordRequest) {
      return res
        .status(400)
        .json({ message: "Something went wrong please try again" });
    }
    const resetUrl = `http://localhost:8080/user/resetpassword/${requestId}`;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_FP_KEY;
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sender = { email: "sahithialam13@gmail.com", name: "Sahithi" };
    const recievers = [{ email: forgotPasswordEmail }];
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: recievers,
        subject: "Reset Password",
        htmlContent: `<p>Hello ${user.fullName},</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
      })
      .then(() => {
        return res.status(201).json({
          message:
            "An email has been sent to your registered mail id with the reset password link",
        });
      })
      .catch((error) => {
        return res.status(500).json({ message: error });
      });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const resetpassword = async (req, res) => {
  const { requestId } = req.params;
  try {
    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: { id: requestId, isactive: true },
    });
    if (!forgotPasswordRequest) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    const resetFormHTML = fs.readFileSync(
      path.join(__dirname, "..", "resetPasswordForm.html"),
      "utf8"
    );
    const formWithRequestId = resetFormHTML.replace("{{requestId}}", requestId);
    return res.send(formWithRequestId);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatepassword = async (req, res) => {
  const { newPassword, confirmPassword, requestId } = req.body;
  const transaction = await sequelize.transaction();
  try {
    if (newPassword !== confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: { id: requestId, isactive: true },
    });
    if (!forgotPasswordRequest) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    const user = await User.findOne({
      where: { id: forgotPasswordRequest.userId },
    });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password in the database
    const updatedUser = await User.update(
      { password: hashedPassword },
      { where: { id: user.id }, transaction }
    );
    
    if (!updatedUser[0]) {
      await transaction.rollback();
      return res.status(404).json({ message: "Something went wrong please try again" });
    }

    // Deactivate the forgot password request
    const updatedForgotPasswordRequest = await forgotPasswordRequest.update({
      isactive: false,
    }, { transaction });
    
    if (!updatedForgotPasswordRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: "Something went wrong please try again" });
    }
    
    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
  userSignup,
  userSignin,
  getUserProfile,
  editUserProfile,
  forgotpassword,
  resetpassword,
  updatepassword,
  download,
};
