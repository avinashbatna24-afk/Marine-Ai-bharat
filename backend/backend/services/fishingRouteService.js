const { createGeographicRoute } = require("./geoRoute");
const { getMarineWarnings } = require("./marineWarningService");
const { getBestFishingZones } = require("./pfzRecommendationService");
const { getWeatherConditions, getWeatherForecast } = require("./weatherService");
const { getMarineConditions, getMarineForecast } = require("./marineDataService");
const { getCycloneStatus } = require("./cycloneService");
const { planMarineRoute } = require("./marineRouteService");
const { createGeographicRiskGrid } = require("./geographicRiskGrid");
const { checkGeofence } = require("./geofenceService");

async function findBestFishingRoute({
  latitude,
  longitude,
  targetDate = null,
  rows = 5,
  cols = 5,
  hazardCells = [],
  restrictedCells = [],
}) {
  // 0. Check whether the fisherman's current location
  // is inside an actual restricted geofence.
  const geofence = checkGeofence(latitude, longitude);

  if (!geofence.success) {
    return {
      success: false,
      message: geofence.message,
    };
  }

  // Never allow route planning from inside a restricted zone.
  if (
    geofence.status === "RESTRICTED" ||
    geofence.insideRestrictedZone === true
  ) {
    return {
      success: false,
      message:
        "Route planning blocked: current location is inside a restricted zone.",
      safetyStatus: "DO_NOT_SAIL",
      geofence,
    };
  }

  // 1. Find the best fishing zone.
  const pfzResult = await getBestFishingZones({
  latitude,
  longitude,
  });

  if (!pfzResult.success) {
    return {
      success: false,
      message: pfzResult.message,
      geofence,
    };
  }

  const destination = pfzResult.recommendedZone;

  // 2. Get marine conditions.
  const marineData = targetDate 
    ? await getMarineForecast(latitude, longitude, targetDate) 
    : await getMarineConditions(latitude, longitude);

  // 3. Get weather conditions.
  const weatherData = targetDate
    ? await getWeatherForecast(latitude, longitude, targetDate)
    : await getWeatherConditions(latitude, longitude);

  // 4. Get official IMD marine warnings.
  const marineWarnings = await getMarineWarnings(latitude, longitude);

  // 5. Get cyclone status.
  const cycloneStatus = await getCycloneStatus(latitude, longitude);

  // 6. Combine live data for the existing risk engine.
  const marineConditions = {
    wind: weatherData.windSpeed ?? 0,
    waveHeight: marineData.waveHeight ?? 0,
    rainProbability: weatherData.precipitationProbability ?? 0,
    lightning: marineWarnings.lightningWarning ? 1 : 0,
    cyclone: cycloneStatus?.active ?? null,
    currentSpeed: marineData.currentSpeed ?? 0,
  };

  // 7. Determine final safety status.
  // Official IMD warnings take priority over
  // normal AI risk recommendations.
  let finalSafetyStatus = "SAFE";

  if (marineWarnings.level === "HIGH") {
    finalSafetyStatus = "DO_NOT_SAIL";
  } else if (marineWarnings.level === "MODERATE") {
    finalSafetyStatus = "CAUTION";
  } else if (marineWarnings.level === "UNAVAILABLE" || cycloneStatus.status === "NOT_AVAILABLE") {
    finalSafetyStatus = "UNKNOWN";
  }

  // 8. Convert geographic start/destination
  // into prototype grid positions.
  const start = {
    row: 0,
    col: 0,
  };

  const goal = {
    row: rows - 1,
    col: cols - 1,
  };

  // 9. Create geographic risk grid.
  const geographicRiskGrid = createGeographicRiskGrid({
    rows,
    cols,
    start: {
      latitude,
      longitude,
    },
    destination: {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
    marineConditions,
    hazardCells,
  });

  // 9.5 Enforce backend geofence restrictions into the pathfinder
  const enforcedRestrictedCells = [...restrictedCells];
  geographicRiskGrid.coordinates.forEach((row) => {
    row.forEach((cell) => {
      const gf = checkGeofence(cell.latitude, cell.longitude);
      if (gf.insideRestrictedZone) {
        enforcedRestrictedCells.push({ row: cell.row, col: cell.col });
      }
    });
  });

  // 10. Generate risk-aware route (SKIP if DO_NOT_SAIL).
  let routeResult = {
    success: false,
    route: [],
    distance: null,
    risk: geographicRiskGrid.risk,
    totalRiskCost: null,
    totalCost: null,
    avoidedHazards: [],
    explanation: `Route calculation blocked. DO NOT SAIL: Official IMD ${marineWarnings.level} warning is active.`
  };
  let geographicRoute = [];

  if (finalSafetyStatus !== "DO_NOT_SAIL" && finalSafetyStatus !== "UNKNOWN") {
    routeResult = planMarineRoute({
      rows,
      cols,
      start,
      goal,
      marineConditions,
      hazardCells,
      restrictedCells: enforcedRestrictedCells,
      customRiskGrid: geographicRiskGrid.grid,
    });

    // 11. Convert grid route into geographic coordinates.
    geographicRoute = routeResult.success
      ? createGeographicRoute({
          route: routeResult.route,
          start: {
            latitude,
            longitude,
          },
          destination: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        })
      : [];
  }

  // 12. Final response.
  return {
    success: routeResult.success,

    fishermanLocation: {
      latitude,
      longitude,
    },

    // Geofence information.
    geofence,

    recommendedFishingZone: {
      id: destination.id,
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      pfzScore: destination.pfz_score,
      confidence: destination.confidence,
      distance: destination.distance,
    },

    // LIVE marine data.
    liveMarineData: marineData,

    // LIVE weather data.
    liveWeatherData: weatherData,

    // OFFICIAL IMD warning.
    marineWarning: marineWarnings,

    // Cyclone status.
    cyclone: cycloneStatus,

    // Final safety decision.
    safetyStatus: finalSafetyStatus,

    // Geographic risk grid.
    geographicRiskGrid: geographicRiskGrid.grid,

    geographicRiskCoordinates: geographicRiskGrid.coordinates,

    // A* route.
    route: routeResult.route || [],

    // Geographic route.
    geographicRoute,

    // Route metrics.
    distance: routeResult.distance ?? null,

    risk: routeResult.risk || geographicRiskGrid.risk,

    totalRiskCost: routeResult.totalRiskCost ?? null,

    totalCost: routeResult.totalCost ?? null,

    explanation:
      finalSafetyStatus === "DO_NOT_SAIL"
        ? `Route calculation blocked. DO NOT SAIL: Official IMD ${marineWarnings.level} warning is active.`
        : finalSafetyStatus === "UNKNOWN"
          ? `Route calculation blocked. SAFETY UNKNOWN: Critical intelligence (IMD or Cyclone data) is unavailable.`
          : finalSafetyStatus === "CAUTION"
            ? `Route optimized with marine risk awareness. CAUTION: Official IMD ${marineWarnings.level} warning is active.`
            : routeResult.explanation || routeResult.message,

    avoidedHazards: routeResult.avoidedHazards || [],

    restrictedCells,

    // Data provenance.
    dataQuality: {
      marineData: targetDate ? "FORECAST" : "LIVE",
      weatherData: targetDate ? "FORECAST" : "LIVE",
      wind: targetDate ? "FORECAST" : "LIVE",
      rainProbability: targetDate ? "FORECAST" : "LIVE",

      // Lightning is obtained from IMD.
      lightning: "LIVE_IMD",

      // Structured cyclone track integration is
      // not available yet.
      cyclone: cycloneStatus?.status ?? "NOT_AVAILABLE",

      marineWarning: "LIVE_IMD",

      // Current geofence dataset is prototype data.
      geofence:
        geofence?.source === "Prototype Geofence Dataset"
          ? "PROTOTYPE"
          : "UNKNOWN",
    },
  };
}

module.exports = {
  findBestFishingRoute,
};
