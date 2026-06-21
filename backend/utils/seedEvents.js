require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Event = require("../models/Event");
const Seat = require("../models/Seat");

const seedData = async () => {
    await connectDB();

    // Clear existing data
    await Event.deleteMany({});
    await Seat.deleteMany({});

    const events = [
        {
            name: "Diljit Dosanjh - India Tour",
            date: new Date("2027-03-18T19:00:00"),
            time: "7:00 PM",
            venue: "JLN Stadium",
            city: "Delhi",
            category: "Concerts",
            description: "Experience the magic of Punjabi music with Diljit Dosanjh's electrifying live performance. This is a once-in-a-lifetime opportunity to witness one of India's biggest music superstars perform his greatest hits.",
            coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 2499,
            totalSeats: 50,
            organizerName: "LiveNation India",
            organizerEmail: "events@livenation.in",
            status: "approved",
        },
        {
            name: "Coldplay - Music of the Spheres",
            date: new Date("2027-04-12T18:30:00"),
            time: "6:30 PM",
            venue: "DY Patil Stadium",
            city: "Mumbai",
            category: "Concerts",
            description: "Coldplay brings their iconic Music of the Spheres World Tour to Mumbai! An unforgettable night of music, lights, and euphoria.",
            coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 4999,
            totalSeats: 40,
            organizerName: "BookMyShow Live",
            organizerEmail: "live@bookmyshow.com",
            status: "approved",
        },
        {
            name: "Vir Das - Mind Fool Tour",
            date: new Date("2027-02-05T20:00:00"),
            time: "8:00 PM",
            venue: "NCPA Tata Theatre",
            city: "Mumbai",
            category: "Comedy",
            description: "Get ready for a night of world-class stand-up comedy as international sensation Vir Das returns with his all-new Mind Fool Tour.",
            coverImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 1499,
            totalSeats: 30,
            organizerName: "Comedy Central",
            organizerEmail: "events@comedycentral.in",
            status: "approved",
        },
        {
            name: "DGTL Festival - Electro Edition",
            date: new Date("2027-05-06T17:00:00"),
            time: "5:00 PM",
            venue: "Nesco Exhibition Centre",
            city: "Mumbai",
            category: "Nightlife",
            description: "Mumbai's biggest electronic music festival is back. Experience world-class DJs, stunning visuals, and an electric atmosphere.",
            coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 3500,
            totalSeats: 60,
            organizerName: "Sunburn",
            organizerEmail: "events@sunburn.in",
            status: "approved",
        },
        {
            name: "Prateek Kuhad Live",
            date: new Date("2027-01-30T19:30:00"),
            time: "7:30 PM",
            venue: "Bharat Mandapam",
            city: "Delhi",
            category: "Concerts",
            description: "An intimate evening with India's favourite indie artist. Expect soulful melodies and heartfelt lyrics under the stars.",
            coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 1800,
            totalSeats: 35,
            organizerName: "Indie Music Co",
            organizerEmail: "events@indiemusic.co",
            status: "approved",
        },
        {
            name: "Zakir Khan - Haq Se Single",
            date: new Date("2027-03-20T20:00:00"),
            time: "8:00 PM",
            venue: "Palace Grounds",
            city: "Bangalore",
            category: "Comedy",
            description: "India's favourite comedian returns with a brand new special that will have you laughing and thinking at the same time.",
            coverImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 999,
            totalSeats: 45,
            organizerName: "Amazon Funnies",
            organizerEmail: "comedy@amazon.in",
            status: "approved",
        },
        {
            name: "Sunburn Arena ft. KSHMR",
            date: new Date("2027-06-01T16:00:00"),
            time: "4:00 PM",
            venue: "MMRDA Grounds",
            city: "Mumbai",
            category: "Nightlife",
            description: "The legendary Sunburn Arena returns with headliner KSHMR. Prepare for a day of non-stop beats and insane drops.",
            coverImage: "https://images.unsplash.com/photo-1602992708529-c9fdb12905c9?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 2800,
            totalSeats: 55,
            organizerName: "Sunburn",
            organizerEmail: "events@sunburn.in",
            status: "approved",
        },
        {
            name: "AP Dhillon - Live in Bangalore",
            date: new Date("2027-04-14T20:00:00"),
            time: "8:00 PM",
            venue: "Palace Grounds",
            city: "Bangalore",
            category: "Concerts",
            description: "AP Dhillon brings his chart-topping hits to Bangalore for the first time! Don't miss the biggest Punjabi pop event of the year.",
            coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
            ticketType: "paid",
            ticketPrice: 3200,
            totalSeats: 50,
            organizerName: "Republic Records India",
            organizerEmail: "events@republic.in",
            status: "approved",
        },
    ];

    for (const eventData of events) {
        const event = await Event.create(eventData);

        // Create seats for this event
        const seats = [];
        for (let i = 1; i <= eventData.totalSeats; i++) {
            seats.push({ eventId: event._id, seatNumber: i, status: "available" });
        }
        await Seat.insertMany(seats);

        console.log(`Seeded: ${event.name} with ${eventData.totalSeats} seats`);
    }

    console.log("Seeding complete!");
    process.exit();
};

seedData();
