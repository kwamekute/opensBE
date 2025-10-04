
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

