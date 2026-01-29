window.planesRegistry = window.planesRegistry || [];

// =======================
// BOEING 707 FAMILY
// =======================

// Boeing 707-120
window.planesRegistry.push({
    model: "Boeing 707-120",
    manufacturer: "Boeing",
    topSpeed: 966, cruiseSpeed: 885,
    fuelCapacityL: 70200, burnRateKgHr: 7800, fuelDensity: 0.804,
    thrustPerEngineLb: 11000, totalThrustLb: 44000, powerToLift: 0.21,
    cabinDim: "28.6m x 3.56m", maxSeatingEcon: 189,
    fourClassCap: "152 (F:12, B:24, PE:30, E:86)",
    dragCoefficient: 0.032, startupNoise: 96, cruiseNoise: 84,
    unitsSold: 56,
    materials: "Aluminium alloy fuselage",
    engineOptions: [
        "Pratt & Whitney JT3C",   // turbojet
        "Pratt & Whitney JT3D"    // turbofan upgrade
    ],
    knownFor: "The first widely used Boeing jetliner.",
    pilotQuote: "Loud, smoky, but iconic — the jet age starter.",
    pilotExperience: 7.5
});

// Boeing 707-320
window.planesRegistry.push({
    model: "Boeing 707-320",
    manufacturer: "Boeing",
    topSpeed: 990, cruiseSpeed: 887,
    fuelCapacityL: 87100, burnRateKgHr: 8100, fuelDensity: 0.804,
    thrustPerEngineLb: 18000, totalThrustLb: 72000, powerToLift: 0.24,
    cabinDim: "33.4m x 3.56m", maxSeatingEcon: 219,
    fourClassCap: "168 (F:14, B:30, PE:36, E:88)",
    dragCoefficient: 0.031, startupNoise: 98, cruiseNoise: 85,
    unitsSold: 130,
    materials: "Aluminium fuselage, JT4A and Conway engine options",
    engineOptions: [
        "Pratt & Whitney JT4A",       // turbojet
        "Rolls‑Royce Conway 508",     // early turbofan
        "Pratt & Whitney JT3D"        // later turbofan upgrade
    ],
    knownFor: "Long‑range capability and powerful engines.",
    pilotQuote: "Raw power and strong climb performance.",
    pilotExperience: 8
});

// =======================
// BOEING 717 (MD‑95)
// =======================

window.planesRegistry.push({
    model: "Boeing 717-200",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 23800, burnRateKgHr: 2500, fuelDensity: 0.804,
    thrustPerEngineLb: 18400, totalThrustLb: 36800, powerToLift: 0.27,
    cabinDim: "24.5m x 3.14m", maxSeatingEcon: 134,
    fourClassCap: "110 (F:8, B:12, PE:22, E:68)",
    dragCoefficient: 0.029, startupNoise: 83, cruiseNoise: 70,
    unitsSold: 156,
    materials: "Aluminium fuselage, modernised MD‑90 heritage",
    engineOptions: [
        "Rolls‑Royce BR715"
    ],
    knownFor: "Last McDonnell Douglas jet, rebadged as a Boeing.",
    pilotQuote: "Strong climb, very smooth, and rugged.",
    pilotExperience: 8.6
});

// =======================
// BOEING 727 FAMILY
// =======================

// Boeing 727-100
window.planesRegistry.push({
    model: "Boeing 727-100",
    manufacturer: "Boeing",
    topSpeed: 965, cruiseSpeed: 895,
    fuelCapacityL: 27900, burnRateKgHr: 5200, fuelDensity: 0.804,
    thrustPerEngineLb: 14500, totalThrustLb: 43500, powerToLift: 0.25,
    cabinDim: "25.4m x 3.56m", maxSeatingEcon: 131,
    fourClassCap: "112 (F:8, B:20, PE:24, E:60)",
    dragCoefficient: 0.030, startupNoise: 95, cruiseNoise: 82,
    unitsSold: 571,
    materials: "Aluminium fuselage, S‑duct design",
    engineOptions: [
        "Pratt & Whitney JT8D‑1",
        "Pratt & Whitney JT8D‑7",
        "Pratt & Whitney JT8D‑9"
    ],
    knownFor: "The original trijet — perfect for short runways.",
    pilotQuote: "Fast, slippery, and unforgiving if mishandled.",
    pilotExperience: 8.4
});

// Boeing 727-200
window.planesRegistry.push({
    model: "Boeing 727-200",
    manufacturer: "Boeing",
    topSpeed: 965, cruiseSpeed: 895,
    fuelCapacityL: 36300, burnRateKgHr: 5400, fuelDensity: 0.804,
    thrustPerEngineLb: 16000, totalThrustLb: 48000, powerToLift: 0.26,
    cabinDim: "30.1m x 3.56m", maxSeatingEcon: 189,
    fourClassCap: "148 (F:8, B:24, PE:36, E:80)",
    dragCoefficient: 0.030, startupNoise: 96, cruiseNoise: 82,
    unitsSold: 1245,
    materials: "Stretched fuselage, improved JT8Ds",
    engineOptions: [
        "Pratt & Whitney JT8D‑9",
        "Pratt & Whitney JT8D‑15",
        "Pratt & Whitney JT8D‑17R"
    ],
    knownFor: "One of the most successful trijets ever produced.",
    pilotQuote: "Demanding but immensely rewarding to fly.",
    pilotExperience: 8.7
});

window.planesRegistry = window.planesRegistry || [];

// =======================
// BOEING 737 ORIGINAL
// =======================

// 737-100
window.planesRegistry.push({
    model: "Boeing 737-100",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 805,
    fuelCapacityL: 16400, burnRateKgHr: 2400, fuelDensity: 0.804,
    thrustPerEngineLb: 14000, totalThrustLb: 28000, powerToLift: 0.23,
    cabinDim: "17.1m x 3.54m", maxSeatingEcon: 115,
    fourClassCap: "104 (F:8, B:16, PE:20, E:60)",
    dragCoefficient: 0.035, startupNoise: 95, cruiseNoise: 82,
    unitsSold: 30,
    materials: "Aluminium fuselage, JT8D engines",
    engineOptions: [
        "Pratt & Whitney JT8D‑7",
        "Pratt & Whitney JT8D‑9"
    ],
    knownFor: "The first-ever 737 variant.",
    pilotQuote: "Short, loud, and very raw — early jetliner feel.",
    pilotExperience: 7.2
});

// 737-200
window.planesRegistry.push({
    model: "Boeing 737-200",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 805,
    fuelCapacityL: 20800, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 16000, totalThrustLb: 32000, powerToLift: 0.24,
    cabinDim: "22.9m x 3.54m", maxSeatingEcon: 130,
    fourClassCap: "112 (F:8, B:20, PE:24, E:60)",
    dragCoefficient: 0.034, startupNoise: 96, cruiseNoise: 82,
    unitsSold: 1114,
    materials: "Aluminium fuselage, JT8D engines",
    engineOptions: [
        "Pratt & Whitney JT8D‑9A",
        "Pratt & Whitney JT8D‑15"
    ],
    knownFor: "Brought the 737 into global mainstream service.",
    pilotQuote: "Plenty of character — but demands respect.",
    pilotExperience: 7.8
});

// 737-200 Advanced
window.planesRegistry.push({
    model: "Boeing 737-200 Advanced",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 805,
    fuelCapacityL: 23000, burnRateKgHr: 2550, fuelDensity: 0.804,
    thrustPerEngineLb: 16000, totalThrustLb: 32000, powerToLift: 0.25,
    cabinDim: "22.9m x 3.54m", maxSeatingEcon: 136,
    fourClassCap: "116 (F:8, B:20, PE:24, E:64)",
    dragCoefficient: 0.034, startupNoise: 96, cruiseNoise: 82,
    unitsSold: 1040,
    materials: "Improved aerodynamics, uprated JT8Ds",
    engineOptions: [
        "Pratt & Whitney JT8D‑15",
        "Pratt & Whitney JT8D‑17R"
    ],
    knownFor: "Better range and better take-off performance.",
    pilotQuote: "More refined and more predictable than early -200s.",
    pilotExperience: 8
});

// =======================
// BOEING 737 CLASSIC
// =======================

// 737-300
window.planesRegistry.push({
    model: "Boeing 737-300",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2700, fuelDensity: 0.804,
    thrustPerEngineLb: 22000, totalThrustLb: 44000, powerToLift: 0.26,
    cabinDim: "27.4m x 3.54m", maxSeatingEcon: 149,
    fourClassCap: "136 (F:8, B:20, PE:28, E:80)",
    dragCoefficient: 0.030, startupNoise: 90, cruiseNoise: 75,
    unitsSold: 1113,
    materials: "Aluminium fuselage, CFM engines",
    engineOptions: [
        "CFM International CFM56‑3B1",
        "CFM International CFM56‑3C1"
    ],
    knownFor: "Start of the legendary Classic series.",
    pilotQuote: "Bulletproof and dependable — a favourite.",
    pilotExperience: 8.4
});

// 737-400
window.planesRegistry.push({
    model: "Boeing 737-400",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2800, fuelDensity: 0.804,
    thrustPerEngineLb: 24000, totalThrustLb: 48000, powerToLift: 0.27,
    cabinDim: "30.4m x 3.54m", maxSeatingEcon: 188,
    fourClassCap: "160 (F:8, B:20, PE:36, E:96)",
    dragCoefficient: 0.030, startupNoise: 91, cruiseNoise: 76,
    unitsSold: 486,
    materials: "Stretched Classic airframe",
    engineOptions: [
        "CFM International CFM56‑3B2"
    ],
    knownFor: "Designed for high-density short haul.",
    pilotQuote: "Surprisingly stable at lower speeds.",
    pilotExperience: 8.5
});

// 737-500
window.planesRegistry.push({
    model: "Boeing 737-500",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 23000, burnRateKgHr: 2500, fuelDensity: 0.804,
    thrustPerEngineLb: 22000, totalThrustLb: 44000, powerToLift: 0.28,
    cabinDim: "27.2m x 3.54m", maxSeatingEcon: 132,
    fourClassCap: "118 (F:8, B:16, PE:24, E:70)",
    dragCoefficient: 0.030, startupNoise: 90, cruiseNoise: 75,
    unitsSold: 389,
    materials: "Short-body, CFM56-powered",
    engineOptions: [
        "CFM International CFM56‑3B1",
        "CFM International CFM56‑3C1"
    ],
    knownFor: "Compact classic with strong short-runway performance.",
    pilotQuote: "Very nimble for a 737.",
    pilotExperience: 8.3
});

// =======================
// BOEING 737 NEXT GENERATION (NG)
// =======================

// 737-600
window.planesRegistry.push({
    model: "Boeing 737-600",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 23800, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 22000, totalThrustLb: 44000, powerToLift: 0.27,
    cabinDim: "28.9m x 3.54m", maxSeatingEcon: 130,
    fourClassCap: "112 (F:8, B:12, PE:24, E:68)",
    dragCoefficient: 0.029, startupNoise: 89, cruiseNoise: 74,
    unitsSold: 69,
    materials: "Compact NG fuselage",
    engineOptions: [
        "CFM International CFM56‑7B20"
    ],
    knownFor: "Rare NG variant.",
    pilotQuote: "Punchy, quick, a little overpowered.",
    pilotExperience: 8.4
});

// 737-700
window.planesRegistry.push({
    model: "Boeing 737-700",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 24000, totalThrustLb: 48000, powerToLift: 0.28,
    cabinDim: "29.9m x 3.54m", maxSeatingEcon: 149,
    fourClassCap: "128 (F:8, B:16, PE:28, E:76)",
    dragCoefficient: 0.029, startupNoise: 89, cruiseNoise: 74,
    unitsSold: 1269,
    materials: "Aluminium fuselage, NG avionics",
    engineOptions: [
        "CFM International CFM56‑7B22",
        "CFM International CFM56‑7B24"
    ],
    knownFor: "Southwest Airlines' workhorse.",
    pilotQuote: "Fantastic climb and tight-turn performance.",
    pilotExperience: 8.8
});

// 737-700ER
window.planesRegistry.push({
    model: "Boeing 737-700ER",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 30000, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 24000, totalThrustLb: 48000, powerToLift: 0.28,
    cabinDim: "29.9m x 3.54m", maxSeatingEcon: 149,
    fourClassCap: "120 (F:8, B:16, PE:24, E:72)",
    dragCoefficient: 0.029, startupNoise: 89, cruiseNoise: 74,
    unitsSold: 8,
    materials: "High MTOW + extra tanks",
    engineOptions: [
        "CFM International CFM56‑7B24",
        "CFM International CFM56‑7B26"
    ],
    knownFor: "True long-range narrowbody.",
    pilotQuote: "Feels like a narrowbody designed for oceanic ops.",
    pilotExperience: 9
});

// 737-800
window.planesRegistry.push({
    model: "Boeing 737-800",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2800, fuelDensity: 0.804,
    thrustPerEngineLb: 27000, totalThrustLb: 54000, powerToLift: 0.29,
    cabinDim: "39.5m x 3.54m", maxSeatingEcon: 189,
    fourClassCap: "162 (F:8, B:20, PE:36, E:98)",
    dragCoefficient: 0.028, startupNoise: 88, cruiseNoise: 73,
    unitsSold: 5000,
    materials: "CFM56-7B powered, best-selling NG model",
    engineOptions: [
        "CFM International CFM56‑7B26",
        "CFM International CFM56‑7B27"
    ],
    knownFor: "One of the best-selling airliners in history.",
    pilotQuote: "Steady, reliable and forgiving.",
    pilotExperience: 9
});

// 737-900
window.planesRegistry.push({
    model: "Boeing 737-900",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 3000, fuelDensity: 0.804,
    thrustPerEngineLb: 27000, totalThrustLb: 54000, powerToLift: 0.29,
    cabinDim: "42.1m x 3.54m", maxSeatingEcon: 220,
    fourClassCap: "180 (F:8, B:24, PE:36, E:112)",
    dragCoefficient: 0.029, startupNoise: 89, cruiseNoise: 74,
    unitsSold: 52,
    materials: "Stretched NG fuselage",
    engineOptions: [
        "CFM International CFM56‑7B26",
        "CFM International CFM56‑7B27"
    ],
    knownFor: "High-capacity NG stretch.",
    pilotQuote: "Heavy in rotation but rock-solid in cruise.",
    pilotExperience: 8.6
});

// 737-900ER
window.planesRegistry.push({
    model: "Boeing 737-900ER",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 29000, burnRateKgHr: 3000, fuelDensity: 0.804,
    thrustPerEngineLb: 27000, totalThrustLb: 54000, powerToLift: 0.29,
    cabinDim: "42.1m x 3.54m", maxSeatingEcon: 220,
    fourClassCap: "192 (F:8, B:24, PE:36, E:124)",
    dragCoefficient: 0.029, startupNoise: 89, cruiseNoise: 74,
    unitsSold: 505,
    materials: "Extra exits + long‑range structure",
    engineOptions: [
        "CFM International CFM56‑7B26",
        "CFM International CFM56‑7B27"
    ],
    knownFor: "True high-capacity NG flagship.",
    pilotQuote: "Feels close to a narrowbody 757.",
    pilotExperience: 9
});

// =======================
// BOEING 737 MAX FAMILY
// =======================

// MAX 7
window.planesRegistry.push({
    model: "Boeing 737 MAX 7",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 28000, totalThrustLb: 56000, powerToLift: 0.30,
    cabinDim: "35.5m x 3.54m", maxSeatingEcon: 172,
    fourClassCap: "150 (F:8, B:16, PE:30, E:96)",
    dragCoefficient: 0.027, startupNoise: 81, cruiseNoise: 69,
    unitsSold: 150,
    materials: "LEAP-1B engines, split-tip winglets",
    engineOptions: [
        "CFM International LEAP‑1B"
    ],
    knownFor: "Longest range of the MAX family.",
    pilotQuote: "Extremely efficient for thinner long routes.",
    pilotExperience: 9.1
});

// MAX 8
window.planesRegistry.push({
    model: "Boeing 737 MAX 8",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 26000, burnRateKgHr: 2500, fuelDensity: 0.804,
    thrustPerEngineLb: 28000, totalThrustLb: 56000, powerToLift: 0.31,
    cabinDim: "39.5m x 3.54m", maxSeatingEcon: 200,
    fourClassCap: "174 (F:8, B:20, PE:36, E:110)",
    dragCoefficient: 0.026, startupNoise: 79, cruiseNoise: 68,
    unitsSold: 4500,
    materials: "LEAP-1B, composite winglets",
    engineOptions: [
        "CFM International LEAP‑1B"
    ],
    knownFor: "The core MAX model with high efficiency.",
    pilotQuote: "Strong, quiet, and very smooth in climb.",
    pilotExperience: 9.3
});

// MAX 9
window.planesRegistry.push({
    model: "Boeing 737 MAX 9",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 27000, burnRateKgHr: 2500, fuelDensity: 0.804,
    thrustPerEngineLb: 28000, totalThrustLb: 56000, powerToLift: 0.31,
    cabinDim: "42.2m x 3.54m", maxSeatingEcon: 220,
    fourClassCap: "188 (F:8, B:24, PE:36, E:120)",
    dragCoefficient: 0.026, startupNoise: 79, cruiseNoise: 68,
    unitsSold: 850,
    materials: "LEAP-1B, stretched fuselage",
    engineOptions: [
        "CFM International LEAP‑1B"
    ],
    knownFor: "Stretch MAX with additional exits.",
    pilotQuote: "Needs careful rotation; otherwise very smooth.",
    pilotExperience: 9
});

// MAX 10
window.planesRegistry.push({
    model: "Boeing 737 MAX 10",
    manufacturer: "Boeing",
    topSpeed: 876, cruiseSpeed: 828,
    fuelCapacityL: 30000, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 28000, totalThrustLb: 56000, powerToLift: 0.32,
    cabinDim: "43.8m x 3.54m", maxSeatingEcon: 230,
    fourClassCap: "198 (F:8, B:24, PE:36, E:130)",
    dragCoefficient: 0.026, startupNoise: 79, cruiseNoise: 68,
    unitsSold: 600,
    materials: "Modified gear, longest MAX model",
    engineOptions: [
        "CFM International LEAP‑1B"
    ],
    knownFor: "Largest 737 ever built.",
    pilotQuote: "Smooth but needs gentle handling on rotation.",
    pilotExperience: 9
});

window.planesRegistry = window.planesRegistry || [];

/* ============================
   BOEING 747 FAMILY
   ============================ */

// 747-100
window.planesRegistry.push({
    model: "Boeing 747-100",
    manufacturer: "Boeing",
    topSpeed: 955, cruiseSpeed: 907,
    fuelCapacityL: 183380, burnRateKgHr: 10500, fuelDensity: 0.804,
    thrustPerEngineLb: 43000, totalThrustLb: 172000, powerToLift: 0.25,
    cabinDim: "56.3m x 6.10m", maxSeatingEcon: 550,
    fourClassCap: "366 (F:14, B:52, PE:40, E:260)",
    dragCoefficient: 0.031, startupNoise: 96, cruiseNoise: 82,
    unitsSold: 167,
    materials: "Aluminium fuselage, JT9D engines",
    engineOptions: [
        "Pratt & Whitney JT9D‑3A",
        "Pratt & Whitney JT9D‑7A"
    ],
    knownFor: "The original Jumbo Jet.",
    pilotQuote: "Like flying a cathedral — incredibly stable.",
    pilotExperience: 8.8
});

// 747-200
window.planesRegistry.push({
    model: "Boeing 747-200",
    manufacturer: "Boeing",
    topSpeed: 955, cruiseSpeed: 907,
    fuelCapacityL: 195600, burnRateKgHr: 11000, fuelDensity: 0.804,
    thrustPerEngineLb: 48000, totalThrustLb: 192000, powerToLift: 0.26,
    cabinDim: "56.3m x 6.10m", maxSeatingEcon: 568,
    fourClassCap: "380 (F:14, B:52, PE:40, E:274)",
    dragCoefficient: 0.031, startupNoise: 97, cruiseNoise: 82,
    unitsSold: 393,
    materials: "Aluminium fuselage, upgraded engines",
    engineOptions: [
        "Pratt & Whitney JT9D‑7Q",
        "General Electric CF6‑50E2"
    ],
    knownFor: "Improved long-haul range.",
    pilotQuote: "Huge, loud, and impressively powerful.",
    pilotExperience: 8.9
});

// 747-300
window.planesRegistry.push({
    model: "Boeing 747-300",
    manufacturer: "Boeing",
    topSpeed: 955, cruiseSpeed: 907,
    fuelCapacityL: 195600, burnRateKgHr: 11200, fuelDensity: 0.804,
    thrustPerEngineLb: 51000, totalThrustLb: 204000, powerToLift: 0.27,
    cabinDim: "56.3m x 6.10m", maxSeatingEcon: 624,
    fourClassCap: "398 (F:14, B:52, PE:40, E:292)",
    dragCoefficient: 0.031, startupNoise: 97, cruiseNoise: 82,
    unitsSold: 81,
    materials: "Extended upper deck",
    engineOptions: [
        "General Electric CF6‑80C2B1",
        "Pratt & Whitney JT9D‑7R4G2"
    ],
    knownFor: "First stretched-upper-deck 747.",
    pilotQuote: "A bit nose-heavy but flies beautifully.",
    pilotExperience: 9.0
});

// 747-400
window.planesRegistry.push({
    model: "Boeing 747-400",
    manufacturer: "Boeing",
    topSpeed: 955, cruiseSpeed: 907,
    fuelCapacityL: 216840, burnRateKgHr: 10100, fuelDensity: 0.804,
    thrustPerEngineLb: 58000, totalThrustLb: 232000, powerToLift: 0.29,
    cabinDim: "56.3m x 6.10m", maxSeatingEcon: 660,
    fourClassCap: "416 (F:14, B:52, PE:40, E:310)",
    dragCoefficient: 0.030, startupNoise: 94, cruiseNoise: 78,
    unitsSold: 694,
    materials: "Composite winglets, digital cockpit",
    engineOptions: [
        "General Electric CF6‑80C2B1F",
        "Pratt & Whitney PW4056",
        "Rolls‑Royce RB211‑524G/H"
    ],
    knownFor: "The ultimate modern Jumbo.",
    pilotQuote: "A remarkably stable long-haul aircraft.",
    pilotExperience: 9.4
});

// 747-8 Intercontinental
window.planesRegistry.push({
    model: "Boeing 747‑8i",
    manufacturer: "Boeing",
    topSpeed: 955, cruiseSpeed: 907,
    fuelCapacityL: 243120, burnRateKgHr: 9700, fuelDensity: 0.804,
    thrustPerEngineLb: 66000, totalThrustLb: 264000, powerToLift: 0.31,
    cabinDim: "63.7m x 6.10m", maxSeatingEcon: 700,
    fourClassCap: "467 (F:14, B:60, PE:66, E:327)",
    dragCoefficient: 0.028, startupNoise: 90, cruiseNoise: 75,
    unitsSold: 47,
    materials: "Composite wing, GEnx engines",
    engineOptions: [
        "General Electric GEnx‑2B67"
    ],
    knownFor: "Longest passenger aircraft in the world.",
    pilotQuote: "Surprisingly light feel for such a giant.",
    pilotExperience: 9.5
});

/* ============================
   BOEING 757 FAMILY
   ============================ */

// 757-200
window.planesRegistry.push({
    model: "Boeing 757-200",
    manufacturer: "Boeing",
    topSpeed: 927, cruiseSpeed: 858,
    fuelCapacityL: 43350, burnRateKgHr: 3600, fuelDensity: 0.804,
    thrustPerEngineLb: 37400, totalThrustLb: 74800, powerToLift: 0.32,
    cabinDim: "39.5m x 3.54m", maxSeatingEcon: 239,
    fourClassCap: "201 (F:16, B:24, PE:36, E:125)",
    dragCoefficient: 0.027, startupNoise: 87, cruiseNoise: 72,
    unitsSold: 913,
    materials: "Aluminium fuselage",
    engineOptions: [
        "Rolls‑Royce RB211‑535C",
        "Rolls‑Royce RB211‑535E4",
        "Pratt & Whitney PW2037",
        "Pratt & Whitney PW2040"
    ],
    knownFor: "Legendary climb performance.",
    pilotQuote: "Climbs like a rocket — a pilot’s dream.",
    pilotExperience: 9.7
});

// 757-300
window.planesRegistry.push({
    model: "Boeing 757-300",
    manufacturer: "Boeing",
    topSpeed: 927, cruiseSpeed: 858,
    fuelCapacityL: 43350, burnRateKgHr: 3900, fuelDensity: 0.804,
    thrustPerEngineLb: 37400, totalThrustLb: 74800, powerToLift: 0.30,
    cabinDim: "47.3m x 3.54m", maxSeatingEcon: 295,
    fourClassCap: "243 (F:16, B:24, PE:36, E:167)",
    dragCoefficient: 0.028, startupNoise: 87, cruiseNoise: 72,
    unitsSold: 55,
    materials: "Stretched narrowbody fuselage",
    engineOptions: [
        "Rolls‑Royce RB211‑535E4B",
        "Pratt & Whitney PW2043"
    ],
    knownFor: "Longest narrowbody airliner ever built.",
    pilotQuote: "Heavier feel than 757‑200 but still powerful.",
    pilotExperience: 9.1
});

/* ============================
   BOEING 767 FAMILY
   ============================ */

// 767-200
window.planesRegistry.push({
    model: "Boeing 767-200",
    manufacturer: "Boeing",
    topSpeed: 913, cruiseSpeed: 851,
    fuelCapacityL: 90900, burnRateKgHr: 5600, fuelDensity: 0.804,
    thrustPerEngineLb: 48000, totalThrustLb: 96000, powerToLift: 0.27,
    cabinDim: "40.2m x 4.72m", maxSeatingEcon: 255,
    fourClassCap: "214 (F:12, B:28, PE:34, E:140)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 71,
    unitsSold: 128,
    materials: "Aluminium twin‑aisle fuselage",
    engineOptions: [
        "General Electric CF6‑80A",
        "Pratt & Whitney JT9D‑7R4",
        "Pratt & Whitney PW4056"
    ],
    knownFor: "First twin‑aisle twinjet in the world.",
    pilotQuote: "Light on controls — very elegant.",
    pilotExperience: 8.9
});

// 767-200ER
window.planesRegistry.push({
    model: "Boeing 767-200ER",
    manufacturer: "Boeing",
    topSpeed: 913, cruiseSpeed: 851,
    fuelCapacityL: 111270, burnRateKgHr: 5500, fuelDensity: 0.804,
    thrustPerEngineLb: 54000, totalThrustLb: 108000, powerToLift: 0.28,
    cabinDim: "40.2m x 4.72m", maxSeatingEcon: 255,
    fourClassCap: "214 (F:12, B:28, PE:34, E:140)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 71,
    unitsSold: 121,
    materials: "ETOPS long‑range twinjet",
    engineOptions: [
        "General Electric CF6‑80A2",
        "Pratt & Whitney PW4060"
    ],
    knownFor: "First transatlantic‑capable 767.",
    pilotQuote: "Exceptionally reliable over the ocean.",
    pilotExperience: 9
});

// 767-300
window.planesRegistry.push({
    model: "Boeing 767-300",
    manufacturer: "Boeing",
    topSpeed: 913, cruiseSpeed: 851,
    fuelCapacityL: 90900, burnRateKgHr: 5800, fuelDensity: 0.804,
    thrustPerEngineLb: 52000, totalThrustLb: 104000, powerToLift: 0.27,
    cabinDim: "48.5m x 4.72m", maxSeatingEcon: 290,
    fourClassCap: "250 (F:12, B:32, PE:36, E:170)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 71,
    unitsSold: 104,
    materials: "Stretched airframe",
    engineOptions: [
        "General Electric CF6‑80C2",
        "Pratt & Whitney PW4056"
    ],
    knownFor: "Reliable medium‑haul widebody.",
    pilotQuote: "Smooth in cruise and stable on approach.",
    pilotExperience: 8.7
});

// 767-300ER
window.planesRegistry.push({
    model: "Boeing 767-300ER",
    manufacturer: "Boeing",
    topSpeed: 913, cruiseSpeed: 851,
    fuelCapacityL: 111270, burnRateKgHr: 5600, fuelDensity: 0.804,
    thrustPerEngineLb: 58000, totalThrustLb: 116000, powerToLift: 0.28,
    cabinDim: "48.5m x 4.72m", maxSeatingEcon: 290,
    fourClassCap: "250 (F:12, B:32, PE:36, E:170)",
    dragCoefficient: 0.028, startupNoise: 85, cruiseNoise: 71,
    unitsSold: 583,
    materials: "Extended-range variant",
    engineOptions: [
        "General Electric CF6‑80C2B6",
        "Pratt & Whitney PW4062",
        "Rolls‑Royce RB211‑524H"
    ],
    knownFor: "The most successful 767 long‑haul version.",
    pilotQuote: "Predictable and very pilot‑friendly.",
    pilotExperience: 9
});

// 767-400ER
window.planesRegistry.push({
    model: "Boeing 767-400ER",
    manufacturer: "Boeing",
    topSpeed: 913, cruiseSpeed: 851,
    fuelCapacityL: 126500, burnRateKgHr: 6000, fuelDensity: 0.804,
    thrustPerEngineLb: 62000, totalThrustLb: 124000, powerToLift: 0.29,
    cabinDim: "54.9m x 4.72m", maxSeatingEcon: 304,
    fourClassCap: "276 (F:8, B:34, PE:40, E:194)",
    dragCoefficient: 0.029, startupNoise: 85, cruiseNoise: 71,
    unitsSold: 37,
    materials: "Stretched fuselage + 777‑style cockpit",
    engineOptions: [
        "General Electric CF6‑80C2",
        "Pratt & Whitney PW4062"
    ],
    knownFor: "Rare long‑haul stretch of the 767.",
    pilotQuote: "Feels like a smaller 777 — very modern.",
    pilotExperience: 9.1
});

window.planesRegistry = window.planesRegistry || [];

/* ============================
   BOEING 777 FAMILY
   ============================ */

// 777-200
window.planesRegistry.push({
    model: "Boeing 777-200",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 171170, burnRateKgHr: 6900, fuelDensity: 0.804,
    thrustPerEngineLb: 77000, totalThrustLb: 154000, powerToLift: 0.30,
    cabinDim: "50.0m x 5.86m", maxSeatingEcon: 440,
    fourClassCap: "312 (F:8, B:40, PE:40, E:224)",
    dragCoefficient: 0.027, startupNoise: 86, cruiseNoise: 79,
    unitsSold: 88,
    materials: "Aluminium fuselage",
    engineOptions: [
        "General Electric GE90‑75B",      // [1](https://en.wikipedia.org/wiki/Boeing_777)
        "Pratt & Whitney PW4074",
        "Rolls‑Royce Trent 884"
    ],
    knownFor: "First-generation long-haul twinjet.",
    pilotQuote: "Big, steady and easy to fly for its size.",
    pilotExperience: 9
});

// 777-200ER
window.planesRegistry.push({
    model: "Boeing 777-200ER",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 195270, burnRateKgHr: 7000, fuelDensity: 0.804,
    thrustPerEngineLb: 77000, totalThrustLb: 154000, powerToLift: 0.31,
    cabinDim: "50.0m x 5.86m", maxSeatingEcon: 440,
    fourClassCap: "314 (F:8, B:42, PE:42, E:222)",
    dragCoefficient: 0.027, startupNoise: 86, cruiseNoise: 79,
    unitsSold: 422,
    materials: "Aluminium fuselage",
    engineOptions: [
        "GE90‑85B",
        "Pratt & Whitney PW4090",
        "Rolls‑Royce Trent 892"          // [1](https://en.wikipedia.org/wiki/Boeing_777)
    ],
    knownFor: "Extremely successful long‑range twinjet.",
    pilotQuote: "A dependable long‑haul horse.",
    pilotExperience: 9.1
});

// 777-200LR
window.planesRegistry.push({
    model: "Boeing 777-200LR",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 202570, burnRateKgHr: 7100, fuelDensity: 0.804,
    thrustPerEngineLb: 110000, totalThrustLb: 220000, powerToLift: 0.34,
    cabinDim: "50.0m x 5.86m", maxSeatingEcon: 440,
    fourClassCap: "301 (F:8, B:42, PE:34, E:217)",
    dragCoefficient: 0.026, startupNoise: 86, cruiseNoise: 79,
    unitsSold: 61,
    materials: "Strengthened structure, raked wings",
    engineOptions: [
        "GE90‑110B1L",
        "GE90‑115B"                      // [1](https://en.wikipedia.org/wiki/Boeing_777)
    ],
    knownFor: "Former longest-range airliner in the world.",
    pilotQuote: "Tremendous climb power — a pilot favourite.",
    pilotExperience: 9.3
});

// 777-300
window.planesRegistry.push({
    model: "Boeing 777-300",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 171170, burnRateKgHr: 7200, fuelDensity: 0.804,
    thrustPerEngineLb: 90000, totalThrustLb: 180000, powerToLift: 0.29,
    cabinDim: "73.9m x 5.86m", maxSeatingEcon: 550,
    fourClassCap: "368 (F:8, B:52, PE:40, E:268)",
    dragCoefficient: 0.027, startupNoise: 87, cruiseNoise: 80,
    unitsSold: 60,
    materials: "Stretched aluminium fuselage",
    engineOptions: [
        "GE90‑90B",
        "Pratt & Whitney PW4098",
        "Rolls‑Royce Trent 892"          // early 777 engines
    ],
    knownFor: "High-capacity twinjet.",
    pilotQuote: "Large but surprisingly agile on the ground.",
    pilotExperience: 9
});

// 777-300ER
window.planesRegistry.push({
    model: "Boeing 777-300ER",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 181270, burnRateKgHr: 7500, fuelDensity: 0.804,
    thrustPerEngineLb: 115000, totalThrustLb: 230000, powerToLift: 0.35,
    cabinDim: "73.9m x 5.86m", maxSeatingEcon: 550,
    fourClassCap: "368 (F:8, B:52, PE:40, E:268)",
    dragCoefficient: 0.025, startupNoise: 88, cruiseNoise: 81,
    unitsSold: 887,
    materials: "Extended range, raked wings",
    engineOptions: [
        "General Electric GE90‑115B"     // EXCLUSIVE ENGINE — only engine allowed
    ],
    knownFor: "Most successful long‑haul twinjet ever built.",
    pilotQuote: "Unbelievable thrust — the king of ETOPS twins.",
    pilotExperience: 9.5
});

// 777F
window.planesRegistry.push({
    model: "Boeing 777F",
    manufacturer: "Boeing",
    topSpeed: 945, cruiseSpeed: 905,
    fuelCapacityL: 181270, burnRateKgHr: 7600, fuelDensity: 0.804,
    thrustPerEngineLb: 110000, totalThrustLb: 220000, powerToLift: 0.34,
    cabinDim: "Main deck cargo (5.86m width)", maxSeatingEcon: 0,
    fourClassCap: "Freighter",
    dragCoefficient: 0.025, startupNoise: 89, cruiseNoise: 82,
    unitsSold: 260,
    materials: "Cargo-strengthened 777‑200LR derivative",
    engineOptions: [
        "GE90‑110B1L",
        "GE90‑115B"
    ],
    knownFor: "Flagship long‑range freighter.",
    pilotQuote: "Flies like a 300ER but with even more authority.",
    pilotExperience: 9.6
});

// 777-8
window.planesRegistry.push({
    model: "Boeing 777-8",
    manufacturer: "Boeing",
    topSpeed: 950, cruiseSpeed: 905,
    fuelCapacityL: 199000, burnRateKgHr: 6800, fuelDensity: 0.804,
    thrustPerEngineLb: 105000, totalThrustLb: 210000, powerToLift: 0.32,
    cabinDim: "69.8m x 5.96m", maxSeatingEcon: 426,
    fourClassCap: "380 (F:8, B:52, PE:40, E:280)",
    dragCoefficient: 0.024, startupNoise: 86, cruiseNoise: 79,
    unitsSold: 60,
    materials: "Composite wings with folding tips",
    engineOptions: [
        "General Electric GE9X"          // EXCLUSIVE 777X engine
    ],
    knownFor: "Ultra‑long-range successor to the 777‑200LR.",
    pilotQuote: "Huge range with elegantly smooth handling.",
    pilotExperience: 9.4
});

// 777-9
window.planesRegistry.push({
    model: "Boeing 777-9",
    manufacturer: "Boeing",
    topSpeed: 950, cruiseSpeed: 905,
    fuelCapacityL: 197977, burnRateKgHr: 6200, fuelDensity: 0.804,
    thrustPerEngineLb: 105000, totalThrustLb: 210000, powerToLift: 0.29,
    cabinDim: "76.7m x 5.96m", maxSeatingEcon: 426,
    fourClassCap: "384 (F:8, B:52, PE:40, E:284)",
    dragCoefficient: 0.026, startupNoise: 89, cruiseNoise: 82,
    unitsSold: 450,
    materials: "Composite wings, carbon wingtips",
    engineOptions: [
        "General Electric GE9X"          // EXCLUSIVE 777X engine
    ],
    knownFor: "Largest twinjet ever built.",
    pilotQuote: "Massive, yet surprisingly light on the controls.",
    pilotExperience: 9.2
});

/* ============================
   BOEING 787 (DREAMLINER) FAMILY
   ============================ */

// 787-8
window.planesRegistry.push({
    model: "Boeing 787-8 Dreamliner",
    manufacturer: "Boeing",
    topSpeed: 954, cruiseSpeed: 902,
    fuelCapacityL: 126206, burnRateKgHr: 4500, fuelDensity: 0.804,
    thrustPerEngineLb: 64000, totalThrustLb: 128000, powerToLift: 0.31,
    cabinDim: "56.7m x 5.49m", maxSeatingEcon: 248,
    fourClassCap: "226 (F:0, B:30, PE:21, E:175)",
    dragCoefficient: 0.023, startupNoise: 78, cruiseNoise: 70,
    unitsSold: 610,
    materials: "Composite fuselage & wings",
    engineOptions: [
        "Rolls‑Royce Trent 1000",         // [2](https://www.visaverge.com/airlines/boeing-777-vs-787-everything-you-need-to-know/)
        "General Electric GEnx‑1B"
    ],
    knownFor: "First carbon‑fibre airliner.",
    pilotQuote: "Incredibly efficient and very quiet.",
    pilotExperience: 9.3
});

// 787-9
window.planesRegistry.push({
    model: "Boeing 787-9 Dreamliner",
    manufacturer: "Boeing",
    topSpeed: 954, cruiseSpeed: 902,
    fuelCapacityL: 126206, burnRateKgHr: 4600, fuelDensity: 0.804,
    thrustPerEngineLb: 74000, totalThrustLb: 148000, powerToLift: 0.32,
    cabinDim: "63.0m x 5.49m", maxSeatingEcon: 296,
    fourClassCap: "266 (F:0, B:38, PE:21, E:207)",
    dragCoefficient: 0.023, startupNoise: 79, cruiseNoise: 72,
    unitsSold: 700,
    materials: "Composite fuselage & wings",
    engineOptions: [
        "Rolls‑Royce Trent 1000",
        "General Electric GEnx‑1B"
    ],
    knownFor: "The most balanced and versatile Dreamliner.",
    pilotQuote: "Smooth, efficient, beautifully stable.",
    pilotExperience: 9.4
});

// 787-10
window.planesRegistry.push({
    model: "Boeing 787-10 Dreamliner",
    manufacturer: "Boeing",
    topSpeed: 954, cruiseSpeed: 902,
    fuelCapacityL: 126206, burnRateKgHr: 4800, fuelDensity: 0.804,
    thrustPerEngineLb: 76000, totalThrustLb: 152000, powerToLift: 0.33,
    cabinDim: "68.3m x 5.49m", maxSeatingEcon: 330,
    fourClassCap: "296 (F:0, B:36, PE:21, E:239)",
    dragCoefficient: 0.023, startupNoise: 80, cruiseNoise: 73,
    unitsSold: 1100,
    materials: "50% composite structure",
    engineOptions: [
        "Rolls‑Royce Trent 1000‑TEN",
        "General Electric GEnx‑1B75"
    ],
    knownFor: "Highly efficient high-capacity long-hauler.",
    pilotQuote: "A joy to fly; extremely smooth automation.",
    pilotExperience: 9.1
});