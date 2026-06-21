const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        time: { type: String },
        venue: { type: String, required: true },
        city: { type: String },
        address: { type: String },
        totalSeats: { type: Number, required: true },
        category: { type: String },
        description: { type: String },
        coverImage: { type: String },
        ticketType: { type: String, enum: ["free", "paid"], default: "paid" },
        ticketPrice: { type: Number, default: 0 },
        earlyBirdEnabled: { type: Boolean, default: false },
        earlyBirdPrice: { type: Number },
        earlyBirdSeats: { type: Number },
        organizerName: { type: String },
        organizerEmail: { type: String },
        organizerPhone: { type: String },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
