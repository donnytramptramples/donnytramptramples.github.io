window.planesRegistry = window.planesRegistry || [];

/* ===========================================================
   XI'AN MA60
   =========================================================== */
window.planesRegistry.push({
    model: "Xi'an MA60",
    manufacturer: "Xi'an Aircraft Industrial Corporation (XAC)",
    topSpeed: 520, cruiseSpeed: 515,
    fuelCapacityL: 5200, burnRateKgHr: 850, fuelDensity: 0.804,
    thrustPerEngineLb: 4500, totalThrustLb: 9000, powerToLift: 0.21,
    cabinDim: "24.7m x 2.7m", maxSeatingEcon: 60,
    fourClassCap: "56 (F:0, B:6, PE:10, E:40)",
    dragCoefficient: 0.036, startupNoise: 88, cruiseNoise: 77,
    unitsSold: 110,
    materials: "Aluminium fuselage, high‑wing STOL design",
    engineOptions: [
        "Pratt & Whitney Canada PW127J"   // Verified engine [1](https://airplaneinsights.com/xian-xian-ma60-specs/)
    ],
    knownFor: "Rugged turboprop engineered for low‑infrastructure airports.",
    pilotQuote: "A tough aircraft — handles rough runways with ease.",
    pilotExperience: 7.6
});

/* ===========================================================
   XI'AN MA600
   =========================================================== */
window.planesRegistry.push({
    model: "Xi'an MA600",
    manufacturer: "Xi'an Aircraft Industrial Corporation (XAC)",
    topSpeed: 525, cruiseSpeed: 515,
    fuelCapacityL: 5500, burnRateKgHr: 820, fuelDensity: 0.804,
    thrustPerEngineLb: 4700, totalThrustLb: 9400, powerToLift: 0.22,
    cabinDim: "24.7m x 2.7m", maxSeatingEcon: 60,
    fourClassCap: "56 (F:0, B:8, PE:10, E:38)",
    dragCoefficient: 0.035, startupNoise: 86, cruiseNoise: 75,
    unitsSold: 18,
    materials: "Updated avionics, revised wing, improved PW127J engines",
    engineOptions: [
        "Pratt & Whitney Canada PW127J"   // Higher thrust version [2](https://en.wikipedia.org/wiki/Xi%27an_MA600)
    ],
    knownFor: "Upgraded MA60 with better handling and performance.",
    pilotQuote: "Feels like a more refined, quieter MA60.",
    pilotExperience: 8.0
});

/* ===========================================================
   XI'AN MA700
   =========================================================== */
window.planesRegistry.push({
    model: "Xi'an MA700",
    manufacturer: "Xi'an Aircraft Industrial Corporation (XAC)",
    topSpeed: 638, cruiseSpeed: 620,
    fuelCapacityL: 6800, burnRateKgHr: 900, fuelDensity: 0.804,
    thrustPerEngineLb: 5000, totalThrustLb: 10000, powerToLift: 0.24,
    cabinDim: "27.9m x 2.86m", maxSeatingEcon: 86,
    fourClassCap: "80 (F:0, B:10, PE:16, E:54)",
    dragCoefficient: 0.034, startupNoise: 84, cruiseNoise: 73,
    unitsSold: 0,
    materials: "Composite propellers, fly‑by‑wire, next‑gen avionics",
    engineOptions: [
        "Pratt & Whitney Canada PW150C"   // Verified engine [3](https://aerocorner.com/aircraft/xian-ma600/)
    ],
    knownFor: "Next‑generation turboprop designed to rival ATR 72 & Q400.",
    pilotQuote: "Expected to deliver top-tier fuel efficiency and smooth FBW control.",
    pilotExperience: 8.9
});