window.planesRegistry = window.planesRegistry || [];

/* =======================================================================
   ILYUSHIN IL‑12 (1940s piston airliner)
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-12",
    manufacturer: "Ilyushin",
    topSpeed: 410, cruiseSpeed: 360,
    fuelCapacityL: 5200, burnRateKgHr: 850, fuelDensity: 0.804,
    thrustPerEngineLb: 1900, totalThrustLb: 3800, powerToLift: 0.22,
    cabinDim: "16.5m x 2.8m", maxSeatingEcon: 27,
    fourClassCap: "24 (F:0, B:4, PE:6, E:14)",
    dragCoefficient: 0.038, startupNoise: 90, cruiseNoise: 76,
    unitsSold: 663,
    materials: "All-metal 1940s airliner",
    engineOptions: [
        "Shvetsov ASh‑82 radial"
    ],
    knownFor: "First Ilyushin post-war passenger plane.",
    pilotQuote: "A reliable workhorse for early Aeroflot routes.",
    pilotExperience: 7.4
});

/* =======================================================================
   ILYUSHIN IL‑14 (improved piston airliner)
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-14",
    manufacturer: "Ilyushin",
    topSpeed: 430, cruiseSpeed: 380,
    fuelCapacityL: 5600, burnRateKgHr: 820, fuelDensity: 0.804,
    thrustPerEngineLb: 1900, totalThrustLb: 3800, powerToLift: 0.23,
    cabinDim: "17.0m x 2.9m", maxSeatingEcon: 32,
    fourClassCap: "28 (F:0, B:4, PE:4, E:20)",
    dragCoefficient: 0.037, startupNoise: 89, cruiseNoise: 75,
    unitsSold: 1345,
    materials: "Improved Il‑12 successor",
    engineOptions: [
        "Shvetsov ASh‑82T radial"
    ],
    knownFor: "Core Aeroflot regional aircraft for decades.",
    pilotQuote: "A stable piston machine, forgiving to fly.",
    pilotExperience: 7.8
});

/* =======================================================================
   ILYUSHIN IL‑18 (turboprop)
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-18",
    manufacturer: "Ilyushin",
    topSpeed: 675, cruiseSpeed: 650,
    fuelCapacityL: 23000, burnRateKgHr: 1700, fuelDensity: 0.804,
    thrustPerEngineLb: 4400, totalThrustLb: 17600, powerToLift: 0.25,
    cabinDim: "24.0m x 3.2m", maxSeatingEcon: 122,
    fourClassCap: "105 (F:6, B:24, PE:24, E:51)",
    dragCoefficient: 0.030, startupNoise: 90, cruiseNoise: 78,
    unitsSold: 564,
    materials: "All‑metal turboprop",
    engineOptions: [
        "Ivchenko AI‑20M turboprop"
    ],
    knownFor: "Most successful Soviet turboprop airliner.",
    pilotQuote: "A tough, long‑range prop — great endurance.",
    pilotExperience: 8.5
});

/* =======================================================================
   ILYUSHIN IL‑62 (early jet) + IL‑62M
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-62",
    manufacturer: "Ilyushin",
    topSpeed: 900, cruiseSpeed: 850,
    fuelCapacityL: 125000, burnRateKgHr: 7800, fuelDensity: 0.804,
    thrustPerEngineLb: 23500, totalThrustLb: 94000, powerToLift: 0.29,
    cabinDim: "42.0m x 3.8m", maxSeatingEcon: 220,
    fourClassCap: "168 (F:12, B:28, PE:20, E:108)",
    dragCoefficient: 0.028, startupNoise: 97, cruiseNoise: 83,
    unitsSold: 292,
    materials: "Rear‑engined quadjet long‑hauler",
    engineOptions: [
        "Kuznetsov NK‑8‑4",
        "Soloviev D‑30KU (Il‑62M)"   // upgraded variant confirmed in results [5](https://airvectors.net/aviljet.html)
    ],
    knownFor: "First long‑range Soviet jetliner.",
    pilotQuote: "Requires finesse — heavy tail makes landing challenging.",
    pilotExperience: 8.8
});

/* =======================================================================
   ILYUSHIN IL‑86 (first Soviet widebody)
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-86",
    manufacturer: "Ilyushin",
    topSpeed: 850, cruiseSpeed: 820,
    fuelCapacityL: 95000, burnRateKgHr: 8800, fuelDensity: 0.804,
    thrustPerEngineLb: 28000, totalThrustLb: 112000, powerToLift: 0.27,
    cabinDim: "45.1m x 5.7m", maxSeatingEcon: 350,
    fourClassCap: "284 (F:12, B:40, PE:52, E:180)",
    dragCoefficient: 0.030, startupNoise: 95, cruiseNoise: 82,
    unitsSold: 106,
    materials: "Soviet widebody with internal airstairs",
    engineOptions: [
        "Kuznetsov NK‑86"
    ],
    knownFor: "The USSR’s answer to the 747 (but smaller).",
    pilotQuote: "A huge, steady platform — but thirsty.",
    pilotExperience: 8.7
});

/* =======================================================================
   ILYUSHIN IL‑96 FAMILY: -300 / -400 / -400M
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-96-300",
    manufacturer: "Ilyushin",
    topSpeed: 900, cruiseSpeed: 860,
    fuelCapacityL: 150000, burnRateKgHr: 9200, fuelDensity: 0.804,
    thrustPerEngineLb: 35970, totalThrustLb: 143880, powerToLift: 0.30,
    cabinDim: "55.4m x 6.1m", maxSeatingEcon: 300,
    fourClassCap: "262 (F:12, B:36, PE:42, E:172)",
    dragCoefficient: 0.026, startupNoise: 92, cruiseNoise: 78,
    unitsSold: 34,
    materials: "Composite flaps, fly‑by‑wire, supercritical wing",
    engineOptions: [
        "Aviadvigatel PS‑90A"
    ],
    knownFor: "Russia’s long‑range presidential and Cubana flagship.",
    pilotQuote: "Surprisingly modern handling for a 1990s quadjet.",
    pilotExperience: 9
});

window.planesRegistry.push({
    model: "Ilyushin Il-96-400",
    manufacturer: "Ilyushin",
    topSpeed: 900, cruiseSpeed: 860,
    fuelCapacityL: 160000, burnRateKgHr: 9500, fuelDensity: 0.804,
    thrustPerEngineLb: 35970, totalThrustLb: 143880,
    powerToLift: 0.31,
    cabinDim: "63.9m x 6.1m", maxSeatingEcon: 370,
    fourClassCap: "310 (F:12, B:36, PE:52, E:210)",
    dragCoefficient: 0.027, startupNoise: 92, cruiseNoise: 78,
    unitsSold: 5,
    materials: "Stretched Il‑96 fuselage, increased payload",
    engineOptions: [
        "Aviadvigatel PS‑90A"
    ],
    knownFor: "Higher‑capacity Il‑96 stretch.",
    pilotQuote: "Handles like a bigger Il‑96‑300 — still smooth.",
    pilotExperience: 8.9
});

window.planesRegistry.push({
    model: "Ilyushin Il-96-400M",
    manufacturer: "Ilyushin",
    topSpeed: 900, cruiseSpeed: 860,
    fuelCapacityL: 165000, burnRateKgHr: 9400, fuelDensity: 0.804,
    thrustPerEngineLb: 35970, totalThrustLb: 143880,
    powerToLift: 0.32,
    cabinDim: "63.9m x 6.1m", maxSeatingEcon: 380,
    fourClassCap: "330 (F:12, B:40, PE:56, E:222)",
    dragCoefficient: 0.027,
    startupNoise: 90, cruiseNoise: 77,
    unitsSold: 0,
    materials: "Updated avionics, stretched capacity, PS‑90A3 engines",
    engineOptions: [
        "Aviadvigatel PS‑90A3"     // documented in Il‑96‑400M programme [7](https://www.uacrussia.ru/en/aircraft/lineup/civil/il-96-300-i-il-96-400m/)
    ],
    knownFor: "Next-gen development of the Il‑96 family.",
    pilotQuote: "A modernised quadjet built to keep the design relevant.",
    pilotExperience: 9.2
});

/* =======================================================================
   ILYUSHIN IL‑114 FAMILY: IL‑114 & IL‑114‑300
   ======================================================================= */
window.planesRegistry.push({
    model: "Ilyushin Il-114",
    manufacturer: "Ilyushin",
    topSpeed: 540, cruiseSpeed: 500,
    fuelCapacityL: 5000, burnRateKgHr: 720, fuelDensity: 0.804,
    thrustPerEngineLb: 2600, totalThrustLb: 5200,
    powerToLift: 0.24,
    cabinDim: "18.0m x 2.7m", maxSeatingEcon: 64,
    fourClassCap: "56 (F:0, B:6, PE:10, E:40)",
    dragCoefficient: 0.034, startupNoise: 82, cruiseNoise: 70,
    unitsSold: 20,
    materials: "Regional turboprop",
    engineOptions: [
        "Klimov TV7‑117SM"
    ],
    knownFor: "Designed to replace An‑24.",
    pilotQuote: "Strong hot-and-high performance.",
    pilotExperience: 8.4
});

window.planesRegistry.push({
    model: "Ilyushin Il-114-300",
    manufacturer: "Ilyushin",
    topSpeed: 560, cruiseSpeed: 520,
    fuelCapacityL: 5150, burnRateKgHr: 700, fuelDensity: 0.804,
    thrustPerEngineLb: 3000, totalThrustLb: 6000,
    powerToLift: 0.26,
    cabinDim: "18.0m x 2.7m", maxSeatingEcon: 68,
    fourClassCap: "58 (F:0, B:8, PE:10, E:40)",
    dragCoefficient: 0.033,
    startupNoise: 80, cruiseNoise: 69,
    unitsSold: 0,
    materials: "Updated Il‑114 with digital avionics",
    engineOptions: [
        "Klimov TV7‑117ST‑01"
    ],
    knownFor: "Modernised production restart of Il‑114.",
    pilotQuote: "Feels cleaner and quieter than the original variant.",
    pilotExperience: 8.6
});