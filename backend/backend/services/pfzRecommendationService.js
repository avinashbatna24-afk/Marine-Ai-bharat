const { rankPFZs } = require("./pfzService");

async function getBestFishingZones({ latitude, longitude, maxDistance = 150 }) {
  latitude = Number(latitude);
  longitude = Number(longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      success: false,
      message: "Valid latitude and longitude are required",
    };
  }

  const ranked = await rankPFZs(latitude, longitude, 10);

  const filtered = ranked.filter((pfz) => (pfz.distanceKm ?? 0) <= maxDistance);

  if (filtered.length === 0) {
    return {
      success: false,
      message: "No suitable fishing zones found nearby",
    };
  }

  const recommendedZone = filtered[0];
  const alternatives = filtered.slice(1, 4);

  return {
    success: true,

    currentLocation: {
      latitude,
      longitude,
    },

    recommendedZone,

    alternatives,

    explainability: {
      whySelected: recommendedZone.selectionExplanation || [
        `✓ Close distance: ${recommendedZone.distanceKm} km`,
        `✓ Data source: ${recommendedZone.source || "INCOIS"}`,
      ],
      overallSuitability: recommendedZone.aiSuitabilityScore ? `${recommendedZone.aiSuitabilityScore}/100` : "Unavailable",
      confidenceScore: recommendedZone.confidenceScore || null,
      perFactorBreakdown: recommendedZone.perFactorBreakdown || {},
      missingDataDisclosure: recommendedZone.missingDataDisclosure || null,
      rejectedAlternatives: alternatives.map((alt) => ({
        id: alt.id,
        name: alt.name,
        rejectionReason: alt.rejectionReason || "Lower overall suitability score",
      })),
    },
  };
}

module.exports = {
  getBestFishingZones,
};
