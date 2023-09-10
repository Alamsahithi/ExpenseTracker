const Payment = require("../models/paymentModel");
const Razorpay = require("razorpay");
const sequelize = require("../configs/databaseConfig");
require("dotenv").config();

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.body;
    const orderExists = await Payment.findOne({ where: { orderId } });
    if (orderExists) {
      return res
        .status(409)
        .json({ status: false, data: null, message: "Order already created" });
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    instance.orders.create(
      { amount: 10000, currency: "INR" },
      async (error, response) => {
        if (error) {
          return res
            .status(500)
            .json({ status: false, data: null, message: error.message });
        }
        const { id, amount, currency } = response;
        const payment = await req.user.createPayment(
          {
            orderId: orderId,
            rpOrderId: id,
            amount: amount / 100,
            currency: currency,
            status: "PENDING",
          },
          { transaction }
        );
        if (!payment) {
          await transaction.rollback();
          throw new Error(
            "Something went wrong while creating payment, please try again"
          );
        }
        await transaction.commit();
        return res.status(201).json({
          status: true,
          data: payment,
          message:
            "Your order has been created successfully, redirecting to payments screen...",
        });
      }
    );
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { rpOrderId, status } = req.body;
    if (!rpOrderId || !status) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const payment = await Payment.findOne({ where: { rpOrderId } });
    if (!payment) {
      return res
        .status(400)
        .json({ status: false, data: null, message: "Order not found" });
    }
    const updates = await Promise.all(
      [
        payment.update({ status }),
        req.user.update({ premiumUser: status === "SUCCESS" ? true : false }),
      ],
      { transaction }
    );
    if (!updates) {
      await transaction.rollback();
      throw new Error("Something went wrong while updating payment status");
    }
    await transaction.commit();
    return res.status(201).json({ status: true, data: updates });
  } catch (error) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ status: false, data: null, message: error.message });
  }
};

module.exports = { createOrder, updateStatus };
