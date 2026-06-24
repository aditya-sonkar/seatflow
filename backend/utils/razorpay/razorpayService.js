const Razorpay = require("razorpay");
const crypto = require("crypto");

/**
 * Determines if Razorpay is running in mock/sandbox mode
 */
const isDummyMode = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return !keyId || !keySecret || keyId.includes("mock") || keyId.includes("default");
};

/**
 * Calculate the total ticket price for a reservation
 * Handles concert-tier pricing (VIP/Gold/GA) and flat pricing
 * @param {Object} event - Event document from MongoDB
 * @param {Array<Number>} seatNumbers - Array of seat numbers booked
 * @returns {Number} totalPrice in INR
 */
const calculateTotalPrice = (event, seatNumbers) => {
    const basePrice = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);
    const totalSeats = event.totalSeats || 0;
    const category = event.category?.toLowerCase() || "";
    const isConcert =
        category.includes("concert") ||
        category.includes("music") ||
        category.includes("festival") ||
        category.includes("nightlife");

    if (event.ticketType === "free") return 0;

    if (isConcert) {
        let totalPrice = 0;
        seatNumbers.forEach((seatNum) => {
            if (seatNum <= Math.ceil(totalSeats * 0.15)) {
                totalPrice += Math.round(basePrice * 3); // VIP
            } else if (seatNum <= Math.ceil(totalSeats * 0.4)) {
                totalPrice += Math.round(basePrice * 2); // Gold
            } else {
                totalPrice += basePrice; // GA
            }
        });
        return totalPrice;
    }

    return basePrice * seatNumbers.length;
};

/**
 * Get the tier label for a seat in a concert-style event
 * @param {Number} seatNum
 * @param {Number} totalSeats
 * @returns {String} "VIP" | "Gold" | "General Admission"
 */
const getSeatTier = (seatNum, totalSeats) => {
    if (seatNum <= Math.ceil(totalSeats * 0.15)) return "VIP";
    if (seatNum <= Math.ceil(totalSeats * 0.4)) return "Gold";
    return "General Admission";
};

/**
 * Create a Razorpay order for the given amount
 * @param {Number} totalPrice - Amount in INR
 * @param {String} reservationId - Used as receipt ID
 * @returns {Object} Razorpay order or mock order
 */
const createRazorpayOrder = async (totalPrice, reservationId) => {
    if (isDummyMode()) {
        return {
            isMock: true,
            orderId: `order_mock_${Date.now()}_${reservationId}`,
            amount: totalPrice * 100,
            currency: "INR",
            keyId: "rzp_test_mockKeyId123",
        };
    }

    const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: totalPrice * 100, // paise
        currency: "INR",
        receipt: `receipt_${reservationId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    return {
        isMock: false,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    };
};

/**
 * Verify a Razorpay payment signature
 * @param {String} razorpayOrderId
 * @param {String} razorpayPaymentId
 * @param {String} razorpaySignature
 * @returns {{ valid: Boolean, error?: String }}
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    if (isDummyMode()) {
        if (!razorpayOrderId || !razorpayPaymentId) {
            return { valid: false, error: "Mock sandbox payment validation failed: transaction ID missing" };
        }
        return { valid: true };
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return { valid: false, error: "Payment details missing" };
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
        return { valid: false, error: "Transaction verification signature invalid" };
    }

    return { valid: true };
};

module.exports = {
    calculateTotalPrice,
    getSeatTier,
    createRazorpayOrder,
    verifyPaymentSignature,
    isDummyMode,
};
