const Razorpay = require("razorpay");
const Payment = require("../models/paymentModal");
const User = require("../models/userModel");

const createOrder = async (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;
    const orderExists = await Payment.findOne({ where: { order_id } });
    if (orderExists) {
      return res
        .status(409)
        .json({ status: false, data: null, message: "Order already created" });
    } else {
      const user = await User.findByPk(req.user.id);
      if (user) {
        const instance = new Razorpay({
          key_id: "rzp_test_FePwfV1JgZ9mFf",
          key_secret: "ds00yvE0oIpGZdBMdaCYiLdm",
        });
        instance.orders.create(
          {
            amount: parseFloat(amount) * 100,
            currency: currency,
          },
          async (error, response) => {
            if (error) {
              return res.status(500).json({ error });
            } else {
              const { id, amount, currency } = response;
              const order = await user.createPayment({
                order_id: order_id,
                razorpay_order_id: id,
                amount: amount / 100,
                currency: currency,
                status: "PENDING",
              });
              if (order) {
                return res.status(201).json(order);
              } else {
                return res
                  .status(500)
                  .json({ message: "Internal server error" });
              }
            }
          }
        );
      } else {
        return res.status(400).json({ message: "User not found" });
      }
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { razorpay_order_id, status } = req.body;
    const user = await User.findByPk(req.user.id);
    if (user) {
      const { id } = user;
      const orderExists = await Payment.findOne({
        where: { razorpay_order_id },
      });
      if (orderExists) {
        await Payment.update({ status }, { where: { razorpay_order_id } });
        const updatedPayment = await Payment.findOne({
          where: { razorpay_order_id },
        });
        if (status === "SUCCESS") {
          await User.update({ premiumUser: true }, { where: { id } });
        } else {
          await User.update({ premiumUser: false }, { where: { id } });
        }
        return res.status(200).json(updatedPayment);
      } else {
        return res.status(400).json({ message: "payment not found" });
      }
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

module.exports = { createOrder, updateOrder };
