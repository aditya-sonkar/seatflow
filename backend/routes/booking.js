const express = require("express");
const { confirmBooking, getUserBookings, createRazorpayOrder } =
    require("../controllers/bookingController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, confirmBooking);
router.post("/razorpay-order", protect, createRazorpayOrder);
router.get("/", protect, getUserBookings);

module.exports = router;