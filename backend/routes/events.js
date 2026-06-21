const express = require("express");

const { getAllEvents, getEventById, createEvent, getOrganizerEvents, updateEvent, deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllEvents);
router.get("/organizer", protect, getOrganizerEvents);
router.get("/:id", getEventById);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;