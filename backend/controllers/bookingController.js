const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Razorpay = require("razorpay");
const crypto = require("crypto");

//@desc Confirm booking from reservation
// @route POST /api/bookings
const confirmBooking = async (req, res) => {
    const { reservationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!reservationId) {
        return res.status(400).json({ message: "reservationId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //Step 1: Find the reservation and check it belongs to this user 
        const reservation = await Reservation.findOne({
            _id: reservationId,
            userId: req.user._id,
        }).session(session);

        if (!reservation) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Reservation not found" });
        }

        //Step 2: Check if the reservation has expired
        if (new Date() > reservation.expiresAt) {
            //Release the seats back to available
            await Seat.updateMany(
                {
                    eventId: reservation.eventId,
                    seatNumber: { $in: reservation.seatNumbers },
                    status: "reserved",
                },
                { $set: { status: "available" } },
                { session }
            );

            //Delete the expired reservation
            await Reservation.deleteOne({ _id: reservationId }).session(session);

            await session.commitTransaction();
            session.endSession();
            return res.status(410).json({ message: "Reservation has expired" });
        }

        // Step 3: Find the Event to calculate total price
        const event = await Event.findById(reservation.eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate totalPrice based on ticketing rules
        const basePrice = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);
        const totalSeats = event.totalSeats || 0;
        const category = event.category?.toLowerCase() || "";
        const isConcert = category.includes("concert") || category.includes("music") || category.includes("festival") || category.includes("nightlife");

        let totalPrice = 0;
        if (event.ticketType === "free") {
            totalPrice = 0;
        } else if (isConcert) {
            reservation.seatNumbers.forEach(seatNum => {
                if (seatNum <= Math.ceil(totalSeats * 0.15)) {
                    totalPrice += Math.round(basePrice * 3); // VIP
                } else if (seatNum <= Math.ceil(totalSeats * 0.40)) {
                    totalPrice += Math.round(basePrice * 2); // Gold
                } else {
                    totalPrice += basePrice; // GA
                }
            });
        } else {
            totalPrice = basePrice * reservation.seatNumbers.length;
        }

        // Verify Payment details if totalPrice > 0
        if (totalPrice > 0) {
            const keyId = process.env.RAZORPAY_KEY_ID;
            const keySecret = process.env.RAZORPAY_KEY_SECRET;
            const isDummy = !keyId || !keySecret || keyId.includes("mock") || keyId.includes("default");

            if (isDummy) {
                // In mock sandbox mode, check parameters are present
                if (!razorpayOrderId || !razorpayPaymentId) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Mock sandbox payment validation failed: transaction ID missing" });
                }
            } else {
                // Real Mode, run cryptographic validation
                if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Payment details missing" });
                }

                const shasum = crypto.createHmac("sha256", keySecret);
                shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
                const digest = shasum.digest("hex");

                if (digest !== razorpaySignature) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Transaction verification signature invalid" });
                }
            }
        }

        // Create the official booking record
        const booking = await Booking.create(
            [
                {
                    userId: req.user._id,
                    eventId: reservation.eventId,
                    seatNumbers: reservation.seatNumbers,
                    totalPrice: totalPrice,
                    razorpayOrderId: razorpayOrderId || null,
                    razorpayPaymentId: razorpayPaymentId || null,
                    razorpaySignature: razorpaySignature || null,
                    paymentStatus: totalPrice > 0 ? "paid" : "free",
                }
            ],
            { session }
        );

        // Step 4: Mark seats as "booked"
        await Seat.updateMany(
            {
                eventId: reservation.eventId,
                seatNumber: { $in: reservation.seatNumbers },
                status: "reserved",
            },
            { $set: { status: "booked" } },
            { session }
        );

        // Step 5: Delete the reservation (it's fulfilled)
        await Reservation.deleteOne({ _id: reservationId }).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json({
            message: "Booking confirmed!",
            eventId: reservation.eventId,
            seatNumbers: reservation.seatNumbers,
            bookingId: booking[0]._id,
            totalPrice,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

//@desc Create Razorpay Order
// @route POST /api/bookings/razorpay-order
const createRazorpayOrder = async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ message: "reservationId is required" });
    }

    try {
        const reservation = await Reservation.findOne({
            _id: reservationId,
            userId: req.user._id,
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (new Date() > reservation.expiresAt) {
            return res.status(410).json({ message: "Reservation has expired" });
        }

        const event = await Event.findById(reservation.eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate totalPrice
        const basePrice = event.ticketType === "free" ? 0 : (event.ticketPrice || 0);
        const totalSeats = event.totalSeats || 0;
        const category = event.category?.toLowerCase() || "";
        const isConcert = category.includes("concert") || category.includes("music") || category.includes("festival") || category.includes("nightlife");

        let totalPrice = 0;
        if (event.ticketType === "free") {
            totalPrice = 0;
        } else if (isConcert) {
            reservation.seatNumbers.forEach(seatNum => {
                if (seatNum <= Math.ceil(totalSeats * 0.15)) {
                    totalPrice += Math.round(basePrice * 3); // VIP
                } else if (seatNum <= Math.ceil(totalSeats * 0.40)) {
                    totalPrice += Math.round(basePrice * 2); // Gold
                } else {
                    totalPrice += basePrice; // GA
                }
            });
        } else {
            totalPrice = basePrice * reservation.seatNumbers.length;
        }

        if (totalPrice === 0) {
            return res.json({
                paymentRequired: false,
                totalPrice: 0,
            });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const isDummy = !keyId || !keySecret || keyId.includes("mock") || keyId.includes("default");

        if (isDummy) {
            return res.json({
                paymentRequired: true,
                isMock: true,
                orderId: `order_mock_${Date.now()}_${reservationId}`,
                amount: totalPrice * 100,
                currency: "INR",
                totalPrice,
                keyId: "rzp_test_mockKeyId123",
            });
        }

        const razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: totalPrice * 100, // paise
            currency: "INR",
            receipt: `receipt_${reservationId}`,
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({
            paymentRequired: true,
            isMock: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            totalPrice,
            keyId: keyId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Get bookings for logged in user
// @route GET /api/bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate("eventId", "name date time venue city coverImage ticketType ticketPrice totalSeats category")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { confirmBooking, getUserBookings, createRazorpayOrder };