window.planesRegistry = window.planesRegistry || [];

/* ============================
   EMB-110 BANDEIRANTE
   ============================ */

window.planesRegistry.push({
    model: "Embraer EMB-110 Bandeirante",
    manufacturer: "Embraer",
    topSpeed: 452, cruiseSpeed: 390,
    fuelCapacityL: 2150, burnRateKgHr: 380, fuelDensity: 0.804,
    thrustPerEngineLb: 850, totalThrustLb: 1700, powerToLift: 0.20,
    cabinDim: "9.7m x 1.8m", maxSeatingEcon: 21,
    fourClassCap: "18 (F:0, B:2, PE:4, E:12)",
    dragCoefficient: 0.038, startupNoise: 87, cruiseNoise: 74,
    unitsSold: 498,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Pratt & Whitney Canada PT6A-34",
        "Pratt & Whitney Canada PT6A-27"
    ],
    knownFor: "Rugged early commuter turboprop.",
    pilotQuote: "Simple, reliable, and very tough.",
    pilotExperience: 7.9
});

/* ============================
   EMB-120 BRASILIA
   ============================ */

window.planesRegistry.push({
    model: "Embraer EMB-120 Brasilia",
    manufacturer: "Embraer",
    topSpeed: 608, cruiseSpeed: 556,
    fuelCapacityL: 2700, burnRateKgHr: 590, fuelDensity: 0.804,
    thrustPerEngineLb: 1800, totalThrustLb: 3600, powerToLift: 0.24,
    cabinDim: "11.8m x 1.9m", maxSeatingEcon: 30,
    fourClassCap: "28 (F:0, B:4, PE:4, E:20)",
    dragCoefficient: 0.033, startupNoise: 88, cruiseNoise: 76,
    unitsSold: 354,
    materials: "Aluminium fuselage, T-tail",
    engineOptions: [
        "Pratt & Whitney Canada PW118",
        "Pratt & Whitney Canada PW118A",
        "Pratt & Whitney Canada PW118B"
    ],
    knownFor: "Fast and powerful 30-seat commuter aircraft.",
    pilotQuote: "Climbs like a jet-powered turboprop.",
    pilotExperience: 8.2
});

/* ============================
   ERJ FAMILY (135/140/145)
   ============================ */

// ERJ-135
window.planesRegistry.push({
    model: "Embraer ERJ-135",
    manufacturer: "Embraer",
    topSpeed: 835, cruiseSpeed: 828,
    fuelCapacityL: 5130, burnRateKgHr: 980, fuelDensity: 0.804,
    thrustPerEngineLb: 7400, totalThrustLb: 14800, powerToLift: 0.29,
    cabinDim: "17.1m x 2.1m", maxSeatingEcon: 37,
    fourClassCap: "30 (F:0, B:4, PE:6, E:20)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 73,
    unitsSold: 123,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Rolls-Royce AE3007A"
    ],
    knownFor: "Smallest ERJ-family jet.",
    pilotQuote: "Nimble and surprisingly sporty.",
    pilotExperience: 8.3
});

// ERJ-140
window.planesRegistry.push({
    model: "Embraer ERJ-140",
    manufacturer: "Embraer",
    topSpeed: 835, cruiseSpeed: 828,
    fuelCapacityL: 5500, burnRateKgHr: 990, fuelDensity: 0.804,
    thrustPerEngineLb: 7400, totalThrustLb: 14800, powerToLift: 0.29,
    cabinDim: "19.5m x 2.1m", maxSeatingEcon: 44,
    fourClassCap: "38 (F:0, B:4, PE:6, E:28)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 73,
    unitsSold: 74,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Rolls-Royce AE3007A1"
    ],
    knownFor: "A shortened ERJ-145 optimised for US scope clauses.",
    pilotQuote: "Flies almost identically to the 145.",
    pilotExperience: 8.4
});

// ERJ-145 / 145XR
window.planesRegistry.push({
    model: "Embraer ERJ-145",
    manufacturer: "Embraer",
    topSpeed: 860, cruiseSpeed: 833,
    fuelCapacityL: 6200, burnRateKgHr: 1050, fuelDensity: 0.804,
    thrustPerEngineLb: 8250, totalThrustLb: 16500, powerToLift: 0.30,
    cabinDim: "20.5m x 2.1m", maxSeatingEcon: 50,
    fourClassCap: "44 (F:0, B:6, PE:8, E:30)",
    dragCoefficient: 0.027, startupNoise: 86, cruiseNoise: 74,
    unitsSold: 1220,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Rolls-Royce AE3007A1",
        "Rolls-Royce AE3007E (ERJ-145XR)"
    ],
    knownFor: "One of the most successful 50-seat jets in history.",
    pilotQuote: "Fast, loud, and very responsive.",
    pilotExperience: 8.5
});

/* ============================
   E-JET FAMILY (E170 / E175 / E190 / E195)
   ============================ */

// E170
window.planesRegistry.push({
    model: "Embraer E170",
    manufacturer: "Embraer",
    topSpeed: 870, cruiseSpeed: 829,
    fuelCapacityL: 9600, burnRateKgHr: 2100, fuelDensity: 0.804,
    thrustPerEngineLb: 13800, totalThrustLb: 27600, powerToLift: 0.29,
    cabinDim: "20.0m x 3.1m", maxSeatingEcon: 76,
    fourClassCap: "70 (F:0, B:8, PE:12, E:50)",
    dragCoefficient: 0.026, startupNoise: 84, cruiseNoise: 72,
    unitsSold: 200,
    materials: "Aluminium fuselage, FBW system",
    engineOptions: [
        "General Electric CF34-8E"
    ],
    knownFor: "Start of the highly successful E-Jet family.",
    pilotQuote: "Smooth like a mini-A320.",
    pilotExperience: 8.7
});

// E175
window.planesRegistry.push({
    model: "Embraer E175",
    manufacturer: "Embraer",
    topSpeed: 890, cruiseSpeed: 829,
    fuelCapacityL: 10500, burnRateKgHr: 2150, fuelDensity: 0.804,
    thrustPerEngineLb: 14200, totalThrustLb: 28400, powerToLift: 0.30,
    cabinDim: "21.8m x 3.1m", maxSeatingEcon: 88,
    fourClassCap: "76 (F:0, B:12, PE:16, E:48)",
    dragCoefficient: 0.026, startupNoise: 84, cruiseNoise: 72,
    unitsSold: 600,
    materials: "Aluminium fuselage",
    engineOptions: [
        "General Electric CF34-8E5"
    ],
    knownFor: "Most popular regional jet in North America.",
    pilotQuote: "Extremely pleasant to hand-fly.",
    pilotExperience: 9.0
});

// E190
window.planesRegistry.push({
    model: "Embraer E190",
    manufacturer: "Embraer",
    topSpeed: 890, cruiseSpeed: 829,
    fuelCapacityL: 13100, burnRateKgHr: 2400, fuelDensity: 0.804,
    thrustPerEngineLb: 18800, totalThrustLb: 37600, powerToLift: 0.30,
    cabinDim: "24.0m x 3.1m", maxSeatingEcon: 114,
    fourClassCap: "98 (F:0, B:12, PE:20, E:66)",
    dragCoefficient: 0.025, startupNoise: 83, cruiseNoise: 71,
    unitsSold: 590,
    materials: "Aluminium fuselage",
    engineOptions: [
        "General Electric CF34-10E"
    ],
    knownFor: "Spacious cabin and strong economics.",
    pilotQuote: "A pilot favourite — smooth and powerful.",
    pilotExperience: 9.2
});

// E195
window.planesRegistry.push({
    model: "Embraer E195",
    manufacturer: "Embraer",
    topSpeed: 890, cruiseSpeed: 829,
    fuelCapacityL: 14100, burnRateKgHr: 2450, fuelDensity: 0.804,
    thrustPerEngineLb: 20300, totalThrustLb: 40600, powerToLift: 0.31,
    cabinDim: "25.7m x 3.1m", maxSeatingEcon: 132,
    fourClassCap: "116 (F:0, B:12, PE:20, E:84)",
    dragCoefficient: 0.025, startupNoise: 83, cruiseNoise: 71,
    unitsSold: 200,
    materials: "Aluminium fuselage",
    engineOptions: [
        "General Electric CF34-10E6"
    ],
    knownFor: "Stretched E-Jet with great economics on short haul.",
    pilotQuote: "Feels solid and bigger than it looks.",
    pilotExperience: 9.1
});

/* ============================
   E-JET E2 FAMILY
   ============================ */

// E175-E2
window.planesRegistry.push({
    model: "Embraer E175-E2",
    manufacturer: "Embraer",
    topSpeed: 890, cruiseSpeed: 829,
    fuelCapacityL: 11200, burnRateKgHr: 1900, fuelDensity: 0.804,
    thrustPerEngineLb: 14500, totalThrustLb: 29000, powerToLift: 0.32,
    cabinDim: "21.8m x 3.1m", maxSeatingEcon: 90,
    fourClassCap: "80 (F:0, B:12, PE:16, E:52)",
    dragCoefficient: 0.024, startupNoise: 81, cruiseNoise: 69,
    unitsSold: 0,
    materials: "Advanced composites, new wing",
    engineOptions: [
        "Pratt & Whitney PW1700G"
    ],
    knownFor: "Second-generation variant with P&W GTF engines.",
    pilotQuote: "Significantly quieter; excellent climb.",
    pilotExperience: 9.3
});

// E190-E2
window.planesRegistry.push({
    model: "Embraer E190-E2",
    manufacturer: "Embraer",
    topSpeed: 900, cruiseSpeed: 840,
    fuelCapacityL: 14200, burnRateKgHr: 2000, fuelDensity: 0.804,
    thrustPerEngineLb: 22000, totalThrustLb: 44000, powerToLift: 0.33,
    cabinDim: "24.0m x 3.1m", maxSeatingEcon: 114,
    fourClassCap: "102 (F:0, B:12, PE:20, E:70)",
    dragCoefficient: 0.023, startupNoise: 80, cruiseNoise: 68,
    unitsSold: 50,
    materials: "Composite wing, updated avionics",
    engineOptions: [
        "Pratt & Whitney PW1900G"
    ],
    knownFor: "One of the quietest and most efficient regional jets.",
    pilotQuote: "Sharper handling than the first-gen E190.",
    pilotExperience: 9.4
});

// E195-E2
window.planesRegistry.push({
    model: "Embraer E195-E2",
    manufacturer: "Embraer",
    topSpeed: 900, cruiseSpeed: 840,
    fuelCapacityL: 15200, burnRateKgHr: 2050, fuelDensity: 0.804,
    thrustPerEngineLb: 23000, totalThrustLb: 46000, powerToLift: 0.34,
    cabinDim: "26.0m x 3.1m", maxSeatingEcon: 146,
    fourClassCap: "128 (F:0, B:16, PE:20, E:92)",
    dragCoefficient: 0.023, startupNoise: 80, cruiseNoise: 68,
    unitsSold: 80,
    materials: "Composite wings + GTF engines",
    engineOptions: [
        "Pratt & Whitney PW1900G"
    ],
    knownFor: "Embraer’s largest and most efficient airliner.",
    pilotQuote: "Very refined and amazingly quiet.",
    pilotExperience: 9.5
});