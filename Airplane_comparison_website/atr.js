window.planesRegistry = window.planesRegistry || [];

/* ===========================================================
   ATR 42 FAMILY
   =========================================================== */

// ATR 42-200
window.planesRegistry.push({
    model: "ATR 42-200",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 490,
    fuelCapacityL: 4600, burnRateKgHr: 600, fuelDensity: 0.804,
    thrustPerEngineLb: 2050, totalThrustLb: 4100, powerToLift: 0.22,
    cabinDim: "13.7m x 2.57m", maxSeatingEcon: 46,
    fourClassCap: "40 (F:0, B:4, PE:6, E:30)",
    dragCoefficient: 0.036, startupNoise: 78, cruiseNoise: 70,
    unitsSold: 37,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Pratt & Whitney Canada PW120"
    ],
    knownFor: "Early ATR variant with modest power.",
    pilotQuote: "Handles well but underpowered in hot-and-high conditions.",
    pilotExperience: 7.4
});

// ATR 42-300 / 320
window.planesRegistry.push({
    model: "ATR 42-300",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 490,
    fuelCapacityL: 4800, burnRateKgHr: 610, fuelDensity: 0.804,
    thrustPerEngineLb: 2150, totalThrustLb: 4300, powerToLift: 0.23,
    cabinDim: "13.7m x 2.57m", maxSeatingEcon: 48,
    fourClassCap: "42 (F:0, B:4, PE:6, E:32)",
    dragCoefficient: 0.035, startupNoise: 77, cruiseNoise: 70,
    unitsSold: 216,
    materials: "Revised wing and systems",
    engineOptions: [
        "Pratt & Whitney Canada PW120A",
        "Pratt & Whitney Canada PW121"
    ],
    knownFor: "Major upgrade to the -200 series.",
    pilotQuote: "Better thrust and climb performance.",
    pilotExperience: 8.0
});

// ATR 42-500
window.planesRegistry.push({
    model: "ATR 42-500",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 500,
    fuelCapacityL: 5000, burnRateKgHr: 630, fuelDensity: 0.804,
    thrustPerEngineLb: 2400, totalThrustLb: 4800, powerToLift: 0.24,
    cabinDim: "13.7m x 2.57m", maxSeatingEcon: 50,
    fourClassCap: "46 (F:0, B:4, PE:8, E:34)",
    dragCoefficient: 0.033, startupNoise: 75, cruiseNoise: 69,
    unitsSold: 426,
    materials: "Refined cabin, improved props, modern avionics",
    engineOptions: [
        "Pratt & Whitney Canada PW127E",
        "Pratt & Whitney Canada PW127F"
    ],
    knownFor: "Quieter and more capable version of the ATR 42.",
    pilotQuote: "A very balanced turboprop — smooth in all phases.",
    pilotExperience: 8.6
});

// ATR 42-600
window.planesRegistry.push({
    model: "ATR 42-600",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 500,
    fuelCapacityL: 5000, burnRateKgHr: 620, fuelDensity: 0.804,
    thrustPerEngineLb: 2750, totalThrustLb: 5500, powerToLift: 0.25,
    cabinDim: "13.7m x 2.57m", maxSeatingEcon: 50,
    fourClassCap: "48 (F:0, B:4, PE:8, E:36)",
    dragCoefficient: 0.032, startupNoise: 74, cruiseNoise: 68,
    unitsSold: 200,
    materials: "Glass cockpit, PW127M engines, composite updates",
    engineOptions: [
        "Pratt & Whitney Canada PW127M"   // confirmed for 600 series [9](https://www.atr-aircraft.com/aircraft-services/aircraft-family/)
    ],
    knownFor: "Latest-generation ATR 42.",
    pilotQuote: "Impressively quiet with sharp climb performance.",
    pilotExperience: 9.0
});

/* ===========================================================
   ATR 72 FAMILY
   =========================================================== */

// ATR 72-200
window.planesRegistry.push({
    model: "ATR 72-200",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 500,
    fuelCapacityL: 6400, burnRateKgHr: 700, fuelDensity: 0.804,
    thrustPerEngineLb: 2400, totalThrustLb: 4800, powerToLift: 0.23,
    cabinDim: "18.6m x 2.57m", maxSeatingEcon: 70,
    fourClassCap: "66 (F:0, B:6, PE:10, E:50)",
    dragCoefficient: 0.035, startupNoise: 78, cruiseNoise: 70,
    unitsSold: 100,
    materials: "Stretched ATR 42 fuselage",
    engineOptions: [
        "Pratt & Whitney Canada PW124B"
    ],
    knownFor: "First generation ATR 72.",
    pilotQuote: "Feels like a bigger ATR 42 with smoother ride quality.",
    pilotExperience: 7.8
});

// ATR 72-210
window.planesRegistry.push({
    model: "ATR 72-210",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 500,
    fuelCapacityL: 6600, burnRateKgHr: 720, fuelDensity: 0.804,
    thrustPerEngineLb: 2600, totalThrustLb: 5200, powerToLift: 0.24,
    cabinDim: "18.6m x 2.57m", maxSeatingEcon: 72,
    fourClassCap: "68 (F:0, B:6, PE:10, E:52)",
    dragCoefficient: 0.034, startupNoise: 76, cruiseNoise: 69,
    unitsSold: 50,
    materials: "More powerful variant for hot-and-high routes",
    engineOptions: [
        "Pratt & Whitney Canada PW127"
    ],
    knownFor: "Better performance version of ATR 72-200.",
    pilotQuote: "Improved thrust makes a big difference at heavy weights.",
    pilotExperience: 8.2
});

// ATR 72-500 (72-212A)
window.planesRegistry.push({
    model: "ATR 72-500",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 511,
    fuelCapacityL: 7000, burnRateKgHr: 760, fuelDensity: 0.804,
    thrustPerEngineLb: 2750, totalThrustLb: 5500, powerToLift: 0.25,
    cabinDim: "18.6m x 2.57m", maxSeatingEcon: 74,
    fourClassCap: "70 (F:0, B:6, PE:12, E:52)",
    dragCoefficient: 0.033, startupNoise: 75, cruiseNoise: 69,
    unitsSold: 500,
    materials: "Major upgrade: new props, PW127F/M engines",
    engineOptions: [
        "Pratt & Whitney Canada PW127F",
        "Pratt & Whitney Canada PW127M"
    ],
    knownFor: "One of the most reliable regional turboprops ever built.",
    pilotQuote: "Smooth handling with great short‑field performance.",
    pilotExperience: 8.7
});

// ATR 72-600 (72-212A)
window.planesRegistry.push({
    model: "ATR 72-600",
    manufacturer: "ATR",
    topSpeed: 556, cruiseSpeed: 511,
    fuelCapacityL: 7500, burnRateKgHr: 750, fuelDensity: 0.804,
    thrustPerEngineLb: 2750, totalThrustLb: 5500, powerToLift: 0.26,
    cabinDim: "18.6m x 2.57m", maxSeatingEcon: 78,
    fourClassCap: "72 (F:0, B:6, PE:10, E:56)",
    dragCoefficient: 0.031, startupNoise: 74, cruiseNoise: 68,
    unitsSold: 1000,
    materials: "Glass cockpit, composite update, PW127M",
    engineOptions: [
        "Pratt & Whitney Canada PW127M"   // confirmed for -600 series [9](https://www.atr-aircraft.com/aircraft-services/aircraft-family/)
    ],
    knownFor: "Most popular turboprop airliner today.",
    pilotQuote: "Exceptionally quiet and fuel-efficient.",
    pilotExperience: 9.4
});