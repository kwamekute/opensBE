require('dotenv').config();
const pool = require("../db/pool"); 
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail", 
 auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.postRequest = async (req, res) => {
  try {
    const { 
      listing_id, 
      name, 
      email, 
      phone, 
      organization,
      check_in, 
      check_out 
    } = req.body;


    //Insert request
    const result = await pool.query(
      `INSERT INTO requests 
       (listing_id, name, email, phone,organization, check_in, check_out)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [listing_id, name, email, phone,organization, check_in, check_out]
    );

    const request = result.rows[0];

    // Send email with formatted datetime
    const mailOptions = {
      from: `"Sanctuary Stays" <opensanctuarybookings@gmail.com>`,
      to: email,
      subject: `Your Request Has Been Received`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; padding:20px; border-radius:8px;">
            <h2 style="color:#2E8B57;">Thank you, ${name}!</h2>
            <p>We’ve received your request for the Listing.</p>

            <div style="margin-top:15px;">
              <p><strong>Check-in:</strong> ${new Date(check_in).toLocaleString()}</p>
              <p><strong>Check-out:</strong> ${new Date(check_out).toLocaleString()}</p>
            </div>

            <p style="margin-top:20px;">We’ll get back to you shortly with confirmation and next steps.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: "Request created and email sent", request });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//get requests
exports.getRequests = async (req, res) => {
  try {
    if (!req.session || !req.session.organization_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No organization ID found in session",
      });
    }

    const orgId = req.session.organization_id;

    console.log(orgId);

    const result = await pool.query(
      `SELECT 
        r.request_id AS request_id, 
        r.name,
        r.email,
        r.phone,
        r.check_in,
        r.check_out,
        l.listing_id AS listing_id,
        l.title AS listing_title,
        l.price,
        l.city
      FROM requests r
      JOIN listings l ON r.listing_id = l.listing_id
      WHERE l.organization_id = $1
      ORDER BY r.created_at DESC`,
      [orgId]
    );

    res.status(200).json({
      success: true,
      requests: result.rows,
    });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching requests",
    });
  }
};

