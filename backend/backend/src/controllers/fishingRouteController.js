const { findBestFishingRoute } = require("../../services/fishingRouteService");

async function getFishingRoute(req, res) {
  try {
    const latitude = Number(req.body.latitude ?? req.body.startLat);
    const longitude = Number(req.body.longitude ?? req.body.startLon);
    const rows = Number(req.body.rows || 5);
    const cols = Number(req.body.cols || 5);
    const hazardCells = req.body.hazardCells || [];
    const restrictedCells = req.body.restrictedCells || [];

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const result = await findBestFishingRoute({
      latitude,
      longitude,
      rows,
      cols,
      hazardCells,
      restrictedCells,
    });

    return res.json(result);
  } catch (error) {
    console.error("Fishing route error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate fishing route",
    });
  }
}

module.exports = {
  getFishingRoute,
};
