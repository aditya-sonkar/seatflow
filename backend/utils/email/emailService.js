const nodemailer = require("nodemailer");

/**
 * Creates a reusable Nodemailer transporter using Gmail SMTP.
 * Requires EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Formats a date to a readable string e.g. "18 Mar 2027"
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

/**
 * Get seat tier for concert-style events
 */
const getSeatTier = (seatNum, totalSeats) => {
    if (seatNum <= Math.ceil(totalSeats * 0.15)) return "VIP";
    if (seatNum <= Math.ceil(totalSeats * 0.4)) return "Gold";
    return "General Admission";
};

/**
 * Determines the tier label for the booking
 */
const getBookingTier = (event, seatNumbers) => {
    const category = event.category?.toLowerCase() || "";
    const isConcert =
        category.includes("concert") ||
        category.includes("music") ||
        category.includes("festival") ||
        category.includes("nightlife");

    if (!isConcert) return "Standard";

    // Use the tier of the first seat (or show "Mixed" if seats span tiers)
    const totalSeats = event.totalSeats || 0;
    const tiers = [...new Set(seatNumbers.map((s) => getSeatTier(s, totalSeats)))];
    return tiers.length === 1 ? tiers[0] : tiers.join(" / ");
};

/**
 * Generates the HTML body for the ticket confirmation email
 * Matches the clean white card design with image, details, barcode
 */
const buildTicketEmailHtml = ({ user, booking, event }) => {
    const tier = getBookingTier(event, booking.seatNumbers);
    const seatDisplay = booking.seatNumbers.join(", ");
    const ticketCount = booking.seatNumbers.length;
    const bookingIdHex = booking._id.toString().toUpperCase();

    const priceDisplay =
        booking.totalPrice === 0
            ? "FREE"
            : `₹${booking.totalPrice.toLocaleString("en-IN")}`;

    // Use event cover image or a fallback gradient
    const hasImage = event.coverImage && event.coverImage.startsWith("http");

    const imageCell = hasImage
        ? `<td width="240" style="
            width: 240px;
            background-image: url('${event.coverImage}');
            background-size: cover;
            background-position: center;
            border-radius: 16px 0 0 16px;
            vertical-align: top;
          ">
            <div style="width: 240px; min-height: 420px;"></div>
          </td>`
        : `<td width="240" style="
            width: 240px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px 0 0 16px;
            vertical-align: center;
            text-align: center;
          ">
            <div style="width: 240px; min-height: 420px; display: flex; align-items: center; justify-content: center;">
              <p style="color: #ffffff; font-size: 48px; margin: 0;">🎟️</p>
            </div>
          </td>`;

    // Generate barcode-like stripes using CSS
    const barcodeStripes = generateBarcodePattern(bookingIdHex);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your SeatFlow Ticket</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f0f5; padding: 40px 0;">
    <tr>
      <td align="center">

        <!-- Greeting -->
        <table width="660" cellpadding="0" cellspacing="0" style="max-width: 660px; width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 0 8px;">
              <p style="margin: 0; color: #333; font-size: 16px;">
                Hey <strong>${user.name}</strong> 👋 Your booking is confirmed!
              </p>
            </td>
          </tr>
        </table>

        <!-- Ticket Card -->
        <table width="660" cellpadding="0" cellspacing="0" style="
          max-width: 660px;
          width: 100%;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        ">
          <tr>
            <!-- Left: Event Image -->
            ${imageCell}

            <!-- Right: Ticket Details -->
            <td style="
              padding: 32px 36px;
              vertical-align: top;
            ">
              <!-- Branding -->
              <p style="
                margin: 0 0 6px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 2.5px;
                text-transform: uppercase;
                color: #6366f1;
              ">SEATFLOW TICKET</p>

              <!-- Event Name -->
              <h1 style="
                margin: 0 0 24px;
                font-size: 22px;
                font-weight: 800;
                color: #1a1a2e;
                line-height: 1.3;
              ">${event.name}</h1>

              <!-- Date & Time Row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">DATE</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e;">${formatDate(event.date)}</p>
                  </td>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">TIME</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e;">${event.time || "TBA"}</p>
                  </td>
                </tr>
              </table>

              <!-- Tier & Quantity Row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">TIER</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e;">${tier}</p>
                  </td>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">QUANTITY</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e;">${ticketCount} Ticket${ticketCount > 1 ? "s" : ""}</p>
                  </td>
                </tr>
              </table>

              <!-- Venue Row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">VENUE</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e;">${event.venue}${event.city ? ", " + event.city : ""}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px;" />

              <!-- Seat & Price Row -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">SEAT</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 800; color: #6366f1;">${seatDisplay}</p>
                  </td>
                  <td width="50%" style="vertical-align: top; text-align: right;">
                    <p style="margin: 0 0 3px; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">PAID AMOUNT</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 800; color: #1a1a2e;">${priceDisplay}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Barcode Section -->
          <tr>
            <td colspan="2" style="padding: 16px 36px 28px; text-align: center;">
              <!-- Dashed tear line -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <!-- Left circle cutout -->
                  <td width="12" style="vertical-align: middle;">
                    <div style="width: 24px; height: 24px; background-color: #f0f0f5; border-radius: 50%; margin-left: -12px;"></div>
                  </td>
                  <td style="border-top: 2px dashed #d1d5db;"></td>
                  <!-- Right circle cutout -->
                  <td width="12" style="vertical-align: middle;">
                    <div style="width: 24px; height: 24px; background-color: #f0f0f5; border-radius: 50%; margin-right: -12px;"></div>
                  </td>
                </tr>
              </table>

              <!-- Barcode image using free API -->
              <img
                src="https://barcode.tec-it.com/barcode.ashx?data=${bookingIdHex}&code=Code128&translate-esc=on&dmsize=Default&eclevel=L&filetype=png&dpi=96&color=%23000000&bgcolor=%23FFFFFF&qunit=Mm&quiet=0&ModWidth=0.3&X=0.3"
                alt="Barcode"
                width="320"
                height="60"
                style="display: block; margin: 0 auto 8px; max-width: 100%; height: auto;"
              />
              <p style="margin: 0; font-size: 11px; font-family: 'Courier New', monospace; color: #6b7280; letter-spacing: 2px;">
                ${bookingIdHex}
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="660" cellpadding="0" cellspacing="0" style="max-width: 660px; width: 100%; margin-top: 24px;">
          <tr>
            <td style="text-align: center; padding: 0 8px;">
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px;">
                📧 Sent to <strong>${user.email}</strong> · Show this ticket at the venue entrance
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} <a href="https://seatflow-live.vercel.app" style="color: #6366f1; text-decoration: none;">SeatFlow</a> — All rights reserved
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Generates a simple barcode-like pattern string from a hex ID (fallback if API fails)
 */
const generateBarcodePattern = (hexId) => {
    return hexId;
};

/**
 * Send a ticket confirmation email to the user after a successful booking.
 * @param {Object} user - User document { name, email }
 * @param {Object} booking - Booking document { _id, seatNumbers, totalPrice }
 * @param {Object} event - Event document { name, date, time, venue, city, category, totalSeats, coverImage }
 */
const sendTicketConfirmationEmail = async (user, booking, event) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[Email] EMAIL_USER or EMAIL_PASS not set — skipping confirmation email.");
        return;
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"SeatFlow 🎟️" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `✅ Booking Confirmed: ${event.name}`,
            html: buildTicketEmailHtml({ user, booking, event }),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Ticket confirmation sent to ${user.email} — MessageId: ${info.messageId}`);
    } catch (error) {
        // Email failure must NOT affect the booking — just log it
        console.error(`[Email] Failed to send ticket confirmation to ${user.email}:`, error.message);
    }
};

module.exports = { sendTicketConfirmationEmail };
