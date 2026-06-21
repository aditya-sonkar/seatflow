const express = require("express");
const { reserveSeats } = require("../controllers/reserveController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, reserveSeats);

module.exports = router;