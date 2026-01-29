window.planesRegistry = window.planesRegistry || [];

/* ===========================================================
   ANTONOV An‑24
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-24",
    manufacturer: "Antonov",
    topSpeed: 450, cruiseSpeed: 430,
    fuelCapacityL: 5400, burnRateKgHr: 820, fuelDensity: 0.804,
    thrustPerEngineLb: 4100, totalThrustLb: 8200, powerToLift: 0.24,
    cabinDim: "13.5m x 2.8m", maxSeatingEcon: 44,
    fourClassCap: "40 (F:0, B:6, PE:8, E:26)",
    dragCoefficient: 0.034, startupNoise: 90, cruiseNoise: 76,
    unitsSold: 1367,
    materials: "All‑metal high‑wing turboprop",
    engineOptions: [
        "Ivchenko AI‑24"     // confirmed by Wikipedia and flugzeuginfo
    ],
    knownFor: "Soviet twin‑turboprop workhorse, rugged and reliable.",
    pilotQuote: "Strong engines, forgiving flight characteristics.",
    pilotExperience: 8.2
});

/* ===========================================================
   ANTONOV An‑26-100 (passenger variant)
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-26-100",
    manufacturer: "Antonov",
    topSpeed: 440, cruiseSpeed: 420,
    fuelCapacityL: 6200, burnRateKgHr: 850, fuelDensity: 0.804,
    thrustPerEngineLb: 4500, totalThrustLb: 9000, powerToLift: 0.25,
    cabinDim: "13.5m x 2.8m", maxSeatingEcon: 52,
    fourClassCap: "46 (F:0, B:6, PE:8, E:32)",
    dragCoefficient: 0.035, startupNoise: 92, cruiseNoise: 77,
    unitsSold: 100,
    materials: "Modified An‑26 cargo aircraft with airliner interior",
    engineOptions: [
        "Ivchenko AI‑24VT"
    ],
    knownFor: "Passenger conversion of the An‑26 tactical airlifter.",
    pilotQuote: "Still rugged, but surprisingly smooth for passengers.",
    pilotExperience: 7.9
});

/* ===========================================================
   ANTONOV An‑28
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-28",
    manufacturer: "Antonov",
    topSpeed: 400, cruiseSpeed: 350,
    fuelCapacityL: 1600, burnRateKgHr: 400, fuelDensity: 0.804,
    thrustPerEngineLb: 1275, totalThrustLb: 2550, powerToLift: 0.21,
    cabinDim: "9.7m x 2.2m", maxSeatingEcon: 18,
    fourClassCap: "16 (F:0, B:2, PE:4, E:10)",
    dragCoefficient: 0.037, startupNoise: 88, cruiseNoise: 72,
    unitsSold: 191,
    materials: "Short‑takeoff commuter high‑wing",
    engineOptions: [
        "PZL‑10S (Polish license‑built Garrett TPE331)"
    ],
    knownFor: "Excellent STOL capability for remote airfields.",
    pilotQuote: "Can land almost anywhere — incredibly robust.",
    pilotExperience: 8.0
});

/* ===========================================================
   ANTONOV An‑38
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-38",
    manufacturer: "Antonov",
    topSpeed: 425, cruiseSpeed: 380,
    fuelCapacityL: 1800, burnRateKgHr: 420, fuelDensity: 0.804,
    thrustPerEngineLb: 1500, totalThrustLb: 3000, powerToLift: 0.22,
    cabinDim: "10.5m x 2.2m", maxSeatingEcon: 27,
    fourClassCap: "24 (F:0, B:4, PE:6, E:14)",
    dragCoefficient: 0.036, startupNoise: 86, cruiseNoise: 72,
    unitsSold: 40,
    materials: "Upgraded An‑28 with revised tail & avionics",
    engineOptions: [
        "Honeywell TPE331‑12"
    ],
    knownFor: "Improved comfort and range over the An‑28.",
    pilotQuote: "Feels more refined than the An‑28, with better climb.",
    pilotExperience: 8.1
});

/* ===========================================================
   ANTONOV An‑140
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-140",
    manufacturer: "Antonov",
    topSpeed: 575, cruiseSpeed: 530,
    fuelCapacityL: 7000, burnRateKgHr: 780, fuelDensity: 0.804,
    thrustPerEngineLb: 2700, totalThrustLb: 5400, powerToLift: 0.27,
    cabinDim: "17.6m x 2.6m", maxSeatingEcon: 52,
    fourClassCap: "48 (F:0, B:6, PE:8, E:34)",
    dragCoefficient: 0.032, startupNoise: 82, cruiseNoise: 70,
    unitsSold: 36,
    materials: "Late‑generation turboprop commuter",
    engineOptions: [
        "Motor‑Sich TV3‑117VMA‑SBM1",
        "Ivchenko Progress AI‑20DM derivative"
    ],
    knownFor: "Designed to replace An‑24 on regional routes.",
    pilotQuote: "A modern feel, capable on short contaminated runways.",
    pilotExperience: 8.4
});

/* ===========================================================
   ANTONOV An‑148
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-148",
    manufacturer: "Antonov",
    topSpeed: 870, cruiseSpeed: 820,
    fuelCapacityL: 13000, burnRateKgHr: 1800, fuelDensity: 0.804,
    thrustPerEngineLb: 15500, totalThrustLb: 31000, powerToLift: 0.31,
    cabinDim: "21.5m x 3.1m", maxSeatingEcon: 85,
    fourClassCap: "74 (F:0, B:8, PE:12, E:54)",
    dragCoefficient: 0.025, startupNoise: 83, cruiseNoise: 71,
    unitsSold: 44,
    materials: "High‑wing regional jet",
    engineOptions: [
        "Progress D‑436‑148 turbofan"
    ],
    knownFor: "Rugged jetliner designed for rough and icy runways.",
    pilotQuote: "Can operate where most jets simply can’t.",
    pilotExperience: 8.8
});

/* ===========================================================
   ANTONOV An‑158
   =========================================================== */
window.planesRegistry.push({
    model: "Antonov An-158",
    manufacturer: "Antonov",
    topSpeed: 870, cruiseSpeed: 820,
    fuelCapacityL: 14000, burnRateKgHr: 1850, fuelDensity: 0.804,
    thrustPerEngineLb: 15500, totalThrustLb: 31000,
    powerToLift: 0.32,
    cabinDim: "23.2m x 3.1m", maxSeatingEcon: 99,
    fourClassCap: "88 (F:0, B:8, PE:14, E:66)",
    dragCoefficient: 0.025, startupNoise: 82, cruiseNoise: 70,
    unitsSold: 22,
    materials: "Stretched An‑148",
    engineOptions: [
        "Progress D‑436‑148F"
    ],
    knownFor: "Stretched version for nearly 100 passengers.",
    pilotQuote: "Feels stable, powerful, and comfortable in cruise.",
    pilotExperience: 9.0
});