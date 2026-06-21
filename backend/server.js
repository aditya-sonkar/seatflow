const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Route imports

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/booking");
const reserveRoutes = require("./routes/reserve");


dotenv.config();

const app = express();

//middleware

app.use(cors());
app.use(express.json());

//Routes

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reserve", reserveRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check

app.get("/", (req, res) => {
    res.send("SeatFlow API is running...");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {

        console.log(`Server running on port ${PORT}`);

        // DB Patch to fix the cover image typo for the Vir Das event
        const Event = require("./models/Event");
        Event.updateOne(
            { name: "Vir Das - Mind Fool Tour" },
            { coverImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=85" }
        ).then(res => {
            if (res.modifiedCount > 0) {
                console.log("[DB Patch] Vir Das cover image URL updated successfully.");
            }
        }).catch(err => {
            console.error("[DB Patch Error]", err);
        });

        // DB Patch to scale seats for Concert/Nightlife events to 50
        const Seat = require("./models/Seat");
        Event.find({ category: { $in: ["Concerts", "Nightlife"] } }).then(async (eventsList) => {
            for (const ev of eventsList) {
                if (ev.totalSeats !== 50) {
                    console.log(`[DB Patch] Scaling seats for event ${ev.name} to 50...`);
                    ev.totalSeats = 50;
                    await ev.save();
                    
                    // Re-create seats
                    await Seat.deleteMany({ eventId: ev._id });
                    const newSeats = [];
                    for (let i = 1; i <= 50; i++) {
                        newSeats.push({ eventId: ev._id, seatNumber: i, status: "available" });
                    }
                    await Seat.insertMany(newSeats);
                    console.log(`[DB Patch] Seeding complete for ${ev.name} with 50 seats.`);
                }
            }
        }).catch(err => {
            console.error("[DB Patch Seats Error]", err);
        });

        // DB Patch to update roles for existing users
        const User = require("./models/User");
        User.find({}).then(async (usersList) => {
            for (const user of usersList) {
                const hasCreatedEvent = await Event.findOne({ createdBy: user._id });
                const isOrganizerInEvent = await Event.findOne({ organizerEmail: user.email });
                if (hasCreatedEvent || isOrganizerInEvent) {
                    if (user.role !== "organizer") {
                        user.role = "organizer";
                        await user.save();
                        console.log(`[DB Patch] Upgraded user ${user.email} to organizer.`);
                    }
                } else if (!user.role || !["user", "organizer"].includes(user.role)) {
                    user.role = "user";
                    await user.save();
                    console.log(`[DB Patch] Set default 'user' role for ${user.email}.`);
                }
            }
        }).catch(err => {
            console.error("[DB Patch User Roles Error]", err);
        });

        // Background worker to release expired reservations
        const Reservation = require("./models/Reservation");
        
        setInterval(async () => {
            try {
                const now = new Date();
                // Find all expired reservations
                const expiredReservations = await Reservation.find({ expiresAt: { $lt: now } });
                
                if (expiredReservations.length > 0) {
                    for (const res of expiredReservations) {
                        // Release the seats back to available
                        await Seat.updateMany(
                            {
                                eventId: res.eventId,
                                seatNumber: { $in: res.seatNumbers },
                                status: "reserved",
                            },
                            { $set: { status: "available" } }
                        );
                        // Delete the reservation document
                        await Reservation.deleteOne({ _id: res._id });
                    }
                    console.log(`[Worker] Released ${expiredReservations.length} expired reservation(s).`);
                }
            } catch (err) {
                console.error("[Worker Error]", err);
            }
        }, 60000); // Run every minute

    });
});