const Event = require("../models/Event");
const Seat = require("../models/Seat");

//@desc Get all events with available seats count
//@route GET /api/events

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: "approved" }).lean();

        //Attach available seat count to each event
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const availableSeats = await Seat.countDocuments({
                    eventId: event._id,
                    status: "available",
                });
                return { ...event, availableSeats };
            })
        );

        res.json(eventsWithCounts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Get single event with all its seats
//@route GET /api/events/:id

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const seats = await Seat.find({ eventId: event._id }).sort({ seatNumber: 1 }).lean();

        res.json({ ...event, seats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Create a new event (with auto-generated seats)
//@route POST /api/events

const createEvent = async (req, res) => {
    try {
        const {
            eventName, category, description, coverImage,
            date, time, city, venue, address,
            ticketType, ticketPrice, totalSeats,
            earlyBirdEnabled, earlyBirdPrice, earlyBirdSeats,
            organizerName, organizerEmail, organizerPhone,
        } = req.body;

        // Validate required fields
        if (!eventName || !date || !venue || !totalSeats) {
            return res.status(400).json({
                message: "Event name, date, venue, and total seats are required",
            });
        }

        // Create the event
        const event = await Event.create({
            name: eventName,
            date: new Date(date),
            time,
            venue,
            city,
            address,
            totalSeats: Number(totalSeats),
            category,
            description,
            coverImage,
            ticketType: ticketType || "paid",
            ticketPrice: ticketType === "free" ? 0 : Number(ticketPrice) || 0,
            earlyBirdEnabled: earlyBirdEnabled || false,
            earlyBirdPrice: Number(earlyBirdPrice) || undefined,
            earlyBirdSeats: Number(earlyBirdSeats) || undefined,
            organizerName,
            organizerEmail,
            organizerPhone,
            createdBy: req.user._id,
            status: "approved",
        });

        // Auto-generate seat documents
        const seats = [];
        for (let i = 1; i <= Number(totalSeats); i++) {
            seats.push({ eventId: event._id, seatNumber: i, status: "available" });
        }
        await Seat.insertMany(seats);

        res.status(201).json({
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Get events created by the logged-in organizer
//@route GET /api/events/organizer
const getOrganizerEvents = async (req, res) => {
    try {
        const Booking = require("../models/Booking");
        const events = await Event.find({ createdBy: req.user._id }).lean();
        
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const totalSeatsCount = event.totalSeats;
                const availableSeats = await Seat.countDocuments({
                    eventId: event._id,
                    status: "available",
                });
                const bookedSeats = await Seat.countDocuments({
                    eventId: event._id,
                    status: "booked",
                });
                const bookings = await Booking.find({ eventId: event._id });
                const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

                return { ...event, availableSeats, bookedSeats, revenue };
            })
        );
        
        res.json(eventsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Update an existing event details
//@route PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check ownership
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this event" });
        }

        const {
            eventName, category, description, coverImage,
            date, time, city, venue, address,
            ticketType, ticketPrice, totalSeats,
            earlyBirdEnabled, earlyBirdPrice, earlyBirdSeats,
            organizerName, organizerEmail, organizerPhone,
        } = req.body;

        const newTotalSeats = Number(totalSeats);
        if (newTotalSeats && newTotalSeats !== event.totalSeats) {
            // Enforce that newTotalSeats cannot be less than the highest seat number currently booked or reserved
            const highestBookedOrReservedSeat = await Seat.findOne({
                eventId: event._id,
                status: { $in: ["booked", "reserved"] }
            }).sort({ seatNumber: -1 });

            const minAllowedSeats = highestBookedOrReservedSeat ? highestBookedOrReservedSeat.seatNumber : 0;
            if (newTotalSeats < minAllowedSeats) {
                return res.status(400).json({
                    message: `Cannot decrease total seats below ${minAllowedSeats} because seat number ${minAllowedSeats} is already booked or held.`
                });
            }

            if (newTotalSeats > event.totalSeats) {
                // Generate extra seats
                const extraSeats = [];
                for (let i = event.totalSeats + 1; i <= newTotalSeats; i++) {
                    extraSeats.push({ eventId: event._id, seatNumber: i, status: "available" });
                }
                await Seat.insertMany(extraSeats);
            } else if (newTotalSeats < event.totalSeats) {
                // Delete the trailing seats (which are available, since we checked minAllowedSeats)
                await Seat.deleteMany({
                    eventId: event._id,
                    seatNumber: { $gt: newTotalSeats }
                });
            }
            event.totalSeats = newTotalSeats;
        }

        event.name = eventName || event.name;
        if (date) event.date = new Date(date);
        event.time = time !== undefined ? time : event.time;
        event.venue = venue || event.venue;
        event.city = city !== undefined ? city : event.city;
        event.address = address !== undefined ? address : event.address;
        event.category = category !== undefined ? category : event.category;
        event.description = description !== undefined ? description : event.description;
        event.coverImage = coverImage !== undefined ? coverImage : event.coverImage;
        event.ticketType = ticketType || event.ticketType;
        event.ticketPrice = ticketType === "free" ? 0 : (ticketPrice !== undefined ? Number(ticketPrice) : event.ticketPrice);
        event.earlyBirdEnabled = earlyBirdEnabled !== undefined ? earlyBirdEnabled : event.earlyBirdEnabled;
        event.earlyBirdPrice = earlyBirdEnabled ? Number(earlyBirdPrice) : undefined;
        event.earlyBirdSeats = earlyBirdEnabled ? Number(earlyBirdSeats) : undefined;
        event.organizerName = organizerName !== undefined ? organizerName : event.organizerName;
        event.organizerEmail = organizerEmail !== undefined ? organizerEmail : event.organizerEmail;
        event.organizerPhone = organizerPhone !== undefined ? organizerPhone : event.organizerPhone;

        await event.save();

        res.json({
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//@desc Delete an event and all associated seats and reservations
//@route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check ownership
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this event" });
        }

        const Reservation = require("../models/Reservation");
        // Delete seats and reservations
        await Seat.deleteMany({ eventId: event._id });
        await Reservation.deleteMany({ eventId: event._id });
        // Delete the event
        await Event.deleteOne({ _id: event._id });

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllEvents, getEventById, createEvent, getOrganizerEvents, updateEvent, deleteEvent };
