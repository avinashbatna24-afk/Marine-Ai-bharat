const { calculateRisk } = require("../../../risk-engine/riskCalculator");

function getMarineRisk(req, res) {
  try {
    const body = req.body || {};
    const windSpeed = body.windSpeed ?? body.wind ?? 10;
    const windGust = body.windGust ?? (Number(windSpeed) * 1.25);
    const waveHeight = body.waveHeight ?? 1.0;
    const rainProbability = body.rainProbability ?? 0;
    const lightning = body.lightning ?? 0;
    const cyclone = body.cyclone ?? false;

    // Convert API field names to risk-engine field names
    const result = calculateRisk({
      wind: Number(windSpeed),
      windGust: Number(windGust),
      waveHeight: Number(waveHeight),
      rainProbability: Number(rainProbability),
      lightning: Number(lightning),
      cyclone: Boolean(cyclone),
      officialWarning: body.officialWarning,
    });

    res.json({
      success: true,
      risk: result,
    });
  } catch (error) {
    console.error("Risk calculation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to calculate marine risk",
    });
  }
}

module.exports = {
  getMarineRisk,
};
