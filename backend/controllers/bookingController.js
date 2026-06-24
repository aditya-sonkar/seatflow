const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const { calculateTotalPrice, createRazorpayOrder, verifyPaymentSignature } = require("../utils/razorpay/razorpayService");
const { sendTicketConfirmationEmail } = require("../utils/email/emailService");

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

        const totalPrice = calculateTotalPrice(event, reservation.seatNumbers);

        // Step 4: Verify Payment details if totalPrice > 0
        if (totalPrice > 0) {
            const { valid, error } = verifyPaymentSignature({
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });

            if (!valid) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: error });
            }
        }

        // Step 5: Create the official booking record
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
                },
            ],
            { session }
        );

        // Step 6: Mark seats as "booked"
        await Seat.updateMany(
            {
                eventId: reservation.eventId,
                seatNumber: { $in: reservation.seatNumbers },
                status: "reserved",
            },
            { $set: { status: "booked" } },
            { session }
        );

        // Step 7: Delete the reservation (it's fulfilled)
        await Reservation.deleteOne({ _id: reservationId }).session(session);

        await session.commitTransaction();
        session.endSession();

        // Step 8: Send confirmation email (non-blocking — after transaction commits)
        const user = await User.findById(req.user._id).select("name email");
        if (user) {
            sendTicketConfirmationEmail(user, booking[0], event).catch((err) =>
                console.error("[Email] Background email error:", err.message)
            );
        }

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
const createRazorpayOrderHandler = async (req, res) => {
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

        const totalPrice = calculateTotalPrice(event, reservation.seatNumbers);

        if (totalPrice === 0) {
            return res.json({
                paymentRequired: false,
                totalPrice: 0,
            });
        }

        const order = await createRazorpayOrder(totalPrice, reservationId);

        res.json({
            paymentRequired: true,
            ...order,
            totalPrice,
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

module.exports = { confirmBooking, getUserBookings, createRazorpayOrder: createRazorpayOrderHandler };