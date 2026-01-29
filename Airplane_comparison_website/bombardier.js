window.planesRegistry = window.planesRegistry || [];

/* ===========================================================
   DASH 8 FAMILY — Q100 / Q200 / Q300 / Q400
   =========================================================== */

// Q100 / Dash 8-100
window.planesRegistry.push({
    model: "Bombardier Dash 8 Q100",
    manufacturer: "Bombardier",
    topSpeed: 498, cruiseSpeed: 450,
    fuelCapacityL: 2330, burnRateKgHr: 430, fuelDensity: 0.804,
    thrustPerEngineLb: 2150, totalThrustLb: 4300, powerToLift: 0.22,
    cabinDim: "15.2m x 2.5m", maxSeatingEcon: 37,
    fourClassCap: "34 (F:0, B:4, PE:6, E:24)",
    dragCoefficient: 0.036, startupNoise: 76, cruiseNoise: 70,
    unitsSold: 229,
    materials: "Aluminium fuselage, composite props",
    engineOptions: [
        "Pratt & Whitney Canada PW120A",
        "Pratt & Whitney Canada PW121"
    ],
    knownFor: "Original high‑performance STOL turboprop.",
    pilotQuote: "Very responsive — feels like a sports turboprop.",
    pilotExperience: 8.0
});

// Q200 / Dash 8-200
window.planesRegistry.push({
    model: "Bombardier Dash 8 Q200",
    manufacturer: "Bombardier",
    topSpeed: 498, cruiseSpeed: 450,
    fuelCapacityL: 2600, burnRateKgHr: 450, fuelDensity: 0.804,
    thrustPerEngineLb: 2350, totalThrustLb: 4700, powerToLift: 0.22,
    cabinDim: "16.1m x 2.5m", maxSeatingEcon: 39,
    fourClassCap: "36 (F:0, B:4, PE:6, E:26)",
    dragCoefficient: 0.035, startupNoise: 74, cruiseNoise: 68,
    unitsSold: 115,
    materials: "Revised fuselage + more powerful engines",
    engineOptions: [
        "Pratt & Whitney Canada PW123C",
        "Pratt & Whitney Canada PW123D"
    ],
    knownFor: "Improved Q100 with extra power.",
    pilotQuote: "Strong performance on short, hot runways.",
    pilotExperience: 8.2
});

// Q300 / Dash 8-300
window.planesRegistry.push({
    model: "Bombardier Dash 8 Q300",
    manufacturer: "Bombardier",
    topSpeed: 532, cruiseSpeed: 498,
    fuelCapacityL: 3500, burnRateKgHr: 550, fuelDensity: 0.804,
    thrustPerEngineLb: 2500, totalThrustLb: 5000, powerToLift: 0.23,
    cabinDim: "20.1m x 2.5m", maxSeatingEcon: 56,
    fourClassCap: "52 (F:0, B:6, PE:8, E:38)",
    dragCoefficient: 0.034, startupNoise: 75, cruiseNoise: 69,
    unitsSold: 267,
    materials: "Aluminium + noise‑suppression Q‑Series tech",
    engineOptions: [
        "Pratt & Whitney Canada PW123",
        "Pratt & Whitney Canada PW123B"
    ],
    knownFor: "Balanced performance and capacity for regionals.",
    pilotQuote: "A pilot’s turboprop: smooth, predictable, solid.",
    pilotExperience: 8.4
});

// Q400 / Dash 8-400
window.planesRegistry.push({
    model: "Bombardier Dash 8 Q400",
    manufacturer: "Bombardier",
    topSpeed: 667, cruiseSpeed: 667,
    fuelCapacityL: 6440, burnRateKgHr: 840, fuelDensity: 0.804,
    thrustPerEngineLb: 5070, totalThrustLb: 10140, powerToLift: 0.28,
    cabinDim: "25.7m x 2.5m", maxSeatingEcon: 90,
    fourClassCap: "76 (F:0, B:8, PE:12, E:56)",
    dragCoefficient: 0.032, startupNoise: 78, cruiseNoise: 70,
    unitsSold: 620,
    materials: "Composite props, advanced avionics, noise canceller",
    engineOptions: [
        "Pratt & Whitney Canada PW150A"
    ],
    knownFor: "Fastest turboprop airliner in the world.",
    pilotQuote: "Performs like a turbofan from the cockpit.",
    pilotExperience: 9.2
});

/* ===========================================================
   CRJ FAMILY — CRJ100/200/700/705/900/1000
   =========================================================== */

// CRJ100 / CRJ200
window.planesRegistry.push({
    model: "Bombardier CRJ200",
    manufacturer: "Bombardier",
    topSpeed: 860, cruiseSpeed: 829,
    fuelCapacityL: 7900, burnRateKgHr: 1600, fuelDensity: 0.804,
    thrustPerEngineLb: 8760, totalThrustLb: 17520, powerToLift: 0.32,
    cabinDim: "21.2m x 2.5m", maxSeatingEcon: 50,
    fourClassCap: "44 (F:0, B:6, PE:8, E:30)",
    dragCoefficient: 0.030, startupNoise: 86, cruiseNoise: 74,
    unitsSold: 1043,
    materials: "Regional jet based on Challenger 600 platform",
    engineOptions: [
        "General Electric CF34-3A1",
        "General Electric CF34-3B1"
    ],
    knownFor: "Workhorse of US regional airlines for two decades.",
    pilotQuote: "Snappy climb, stiff landings — classic CRJ feel.",
    pilotExperience: 8.7
});

// CRJ700
window.planesRegistry.push({
    model: "Bombardier CRJ700",
    manufacturer: "Bombardier",
    topSpeed: 876, cruiseSpeed: 829,
    fuelCapacityL: 8700, burnRateKgHr: 1700, fuelDensity: 0.804,
    thrustPerEngineLb: 12670, totalThrustLb: 25340, powerToLift: 0.33,
    cabinDim: "24.9m x 2.5m", maxSeatingEcon: 78,
    fourClassCap: "70 (F:0, B:12, PE:14, E:44)",
    dragCoefficient: 0.029, startupNoise: 83, cruiseNoise: 72,
    unitsSold: 330,
    materials: "Stretched CRJ platform",
    engineOptions: [
        "General Electric CF34-8C1"
    ],
    knownFor: "Efficient and popular for scope‑clause operations.",
    pilotQuote: "Feels more balanced than the CRJ200.",
    pilotExperience: 9.0
});

// CRJ705 / CRJ550
window.planesRegistry.push({
    model: "Bombardier CRJ705 / CRJ550",
    manufacturer: "Bombardier",
    topSpeed: 876, cruiseSpeed: 829,
    fuelCapacityL: 8550, burnRateKgHr: 1650, fuelDensity: 0.804,
    thrustPerEngineLb: 12670, totalThrustLb: 25340, powerToLift: 0.34,
    cabinDim: "24.9m x 2.5m", maxSeatingEcon: 65,
    fourClassCap: "50 (F:10, B:12, PE:8, E:20)",
    dragCoefficient: 0.029, startupNoise: 83, cruiseNoise: 72,
    unitsSold: 80,
    materials: "CRJ700 airframe with premium cabin",
    engineOptions: [
        "General Electric CF34-8C5"
    ],
    knownFor: "Premium 50‑seat configuration for US airlines.",
    pilotQuote: "Same CRJ handling, nicer cabin.",
    pilotExperience: 8.8
});

// CRJ900
window.planesRegistry.push({
    model: "Bombardier CRJ900",
    manufacturer: "Bombardier",
    topSpeed: 880, cruiseSpeed: 829,
    fuelCapacityL: 9900, burnRateKgHr: 1750, fuelDensity: 0.804,
    thrustPerEngineLb: 13560, totalThrustLb: 27120, powerToLift: 0.34,
    cabinDim: "30.3m x 2.5m", maxSeatingEcon: 90,
    fourClassCap: "75 (F:0, B:12, PE:14, E:49)",
    dragCoefficient: 0.028, startupNoise: 82, cruiseNoise: 72,
    unitsSold: 550,
    materials: "Stretched 700, performance‑enhanced",
    engineOptions: [
        "General Electric CF34-8C5",
        "General Electric CF34-8C5A1"
    ],
    knownFor: "One of the most efficient 90‑seat jets.",
    pilotQuote: "Quick, agile, and more forgiving at low speeds.",
    pilotExperience: 9.1
});

// CRJ1000
window.planesRegistry.push({
    model: "Bombardier CRJ1000",
    manufacturer: "Bombardier",
    topSpeed: 880, cruiseSpeed: 829,
    fuelCapacityL: 11300, burnRateKgHr: 1820, fuelDensity: 0.804,
    thrustPerEngineLb: 13560, totalThrustLb: 27120, powerToLift: 0.35,
    cabinDim: "36.4m x 2.5m", maxSeatingEcon: 104,
    fourClassCap: "92 (F:0, B:12, PE:16, E:64)",
    dragCoefficient: 0.028, startupNoise: 82, cruiseNoise: 72,
    unitsSold: 63,
    materials: "Largest CRJ variant",
    engineOptions: [
        "General Electric CF34-8C5A1"
    ],
    knownFor: "High‑capacity CRJ, excellent on medium regional sectors.",
    pilotQuote: "Long airplane — rotation needs finesse.",
    pilotExperience: 8.9
});