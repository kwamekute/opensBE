
const pool = require("../db/pool");

exports.postListing = async (req, res) => {
  const client = await pool.connect();
  try {
    const { orgId,description, city, latitude, longitude, amenities, price, photos, capacity } = req.body;
console.log(req.body);
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: "At least one photo is required" });
    }

    await client.query("BEGIN");

    // Insert listing
    const result = await client.query(
      `INSERT INTO listings (organization_id, title, city, latitude, longitude, amenities, price, images, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [orgId,description, city, latitude, longitude, amenities, price, photos, capacity]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Listing created successfully",
     listing_id: result.rows[0].listing_id,     });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating listing with photos:", err);
    res.status(500).json({ error: "Failed to create listing with photos" });
  } finally {
    client.release();
  }
};

//Get all listings
exports.getListings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings ORDER BY listing_id DESC");
    console.log("Listings from DB:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch listing from DB
    const result = await pool.query("SELECT * FROM listings WHERE listing_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const listing = result.rows[0];

    // ✅ Ensure Cloudinary image URLs are returned properly
    // If you store images in a JSON/array column named "images", this ensures it's parsed correctly
    if (typeof listing.images === "string") {
      try {
        listing.images = JSON.parse(listing.images);
      } catch {
        listing.images = [listing.images];
      }
    }

    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get listing for organizations 
exports.getListingsByOrg = async (req, res) => {
  try {
    // ✅ Ensure session and organization_id exist
    if (!req.session || !req.session.organization_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No organization ID found in session",
      });
    }

    const orgId = req.session.organization_id;
    console.log("Organization ID from session:", orgId);

    // ✅ Fetch listings for this organization
    const result = await pool.query(
      `SELECT * FROM listings WHERE organization_id = $1 ORDER BY listing_id DESC`,
      [orgId]
    );

    console.log(result);

    // ✅ Respond safely
    return res.json({
      success: true,
      listings: result.rows || [],
      
    });
  } catch (err) {
    console.error("Error fetching listings by organization:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching organization listings",
    });
  }
};

//filtered listings
  
exports.getFilteredListings = async (req, res) => {
  const { city } = req.body;
  try {
    const listings = await pool.query(
      "SELECT * FROM listings WHERE LOWER(city) LIKE LOWER($1)",
      [`%${city}%`]
    );
    res.json({ success: true, listings: listings.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
