const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");

//@desc reserve seats (10-minute hold)
//@route POST /api/reserve

const reserveSeats = async (req, res) => {
    const { eventId, seatNumbers } = req.body;

    if (!eventId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        return res.status(400).json({ message: "eventId and seatNumbers[] are required" });
    }
    // Use a MongoDB transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Atomically update ONLY seats that are currently "available"

        const result = await Seat.updateMany(
            {
                eventId,
                seatNumber: { $in: seatNumbers },
                status: "available", // <--- KEY: only grab available seats
            },
            { $set: { status: "reserved" } },
            { session }
        );

        // 2. Check if All requested seats are reserved 
        if (result.modifiedCount !== seatNumbers.length) {
            // Some were not available - roll back
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                message: "One or more seats are no longer available",
            });
        }

        // 3. Create reservation (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const reservation = await Reservation.create(
            [
                {
                    userId: req.user._id,
                    eventId,
                    seatNumbers,
                    expiresAt,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Seats reserved successfully",
            reservation: reservation[0],
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

module.exports = { reserveSeats }