window.planesRegistry = window.planesRegistry || [];

/* ============================
   COMAC C909 (formerly ARJ21)
   ============================ */

// C909-700 (ARJ21-700)
window.planesRegistry.push({
    model: "COMAC C909-700",
    manufacturer: "COMAC",
    topSpeed: 871, cruiseSpeed: 823,
    fuelCapacityL: 15900, burnRateKgHr: 2400, fuelDensity: 0.804,
    thrustPerEngineLb: 18500, totalThrustLb: 37000, powerToLift: 0.27,
    cabinDim: "20.4m x 3.14m", maxSeatingEcon: 95,
    fourClassCap: "78 (F:0, B:8, PE:16, E:54)",
    dragCoefficient: 0.031, startupNoise: 86, cruiseNoise: 75,
    unitsSold: 150,
    materials: "Aluminium fuselage, composite tail",
    engineOptions: [
        "General Electric CF34-10A"   // confirmed regional jet engine family
    ],
    knownFor: "China’s first mass‑produced jetliner (formerly ARJ21).",
    pilotQuote: "Very stable on low‑speed approaches — MD‑80 DNA with modern systems.",
    pilotExperience: 8
});

// C909-900 (ARJ21-900 stretch)
window.planesRegistry.push({
    model: "COMAC C909-900",
    manufacturer: "COMAC",
    topSpeed: 871, cruiseSpeed: 823,
    fuelCapacityL: 17500, burnRateKgHr: 2550, fuelDensity: 0.804,
    thrustPerEngineLb: 19500, totalThrustLb: 39000, powerToLift: 0.28,
    cabinDim: "24.0m x 3.14m", maxSeatingEcon: 105,
    fourClassCap: "88 (F:0, B:8, PE:18, E:62)",
    dragCoefficient: 0.031, startupNoise: 86, cruiseNoise: 75,
    unitsSold: 50,
    materials: "Stretched variant",
    engineOptions: [
        "General Electric CF34-10A"
    ],
    knownFor: "Higher‑capacity version of the C909/ARJ21.",
    pilotQuote: "Same handling as the -700, just a bit heavier.",
    pilotExperience: 8.2
});

/* ============================
   COMAC C919 FAMILY
   ============================ */

// C919 Standard
window.planesRegistry.push({
    model: "COMAC C919",
    manufacturer: "COMAC",
    topSpeed: 900, cruiseSpeed: 833,
    fuelCapacityL: 27000, burnRateKgHr: 2600, fuelDensity: 0.804,
    thrustPerEngineLb: 31000, totalThrustLb: 62000, powerToLift: 0.29,
    cabinDim: "32.5m x 3.9m", maxSeatingEcon: 192,
    fourClassCap: "164 (F:0, B:8, PE:16, E:140)",
    dragCoefficient: 0.031, startupNoise: 88, cruiseNoise: 74,
    unitsSold: 1000,
    materials: "Al‑Li fuselage, composite tail",
    engineOptions: [
        "CFM International LEAP‑1C"   // confirmed engine family
    ],
    knownFor: "Direct competitor to A320neo and 737 MAX.",
    pilotQuote: "Feels very similar to Airbus FBW logic.",
    pilotExperience: 8.7
});

// C919 Extended Range (ER)
window.planesRegistry.push({
    model: "COMAC C919 ER",
    manufacturer: "COMAC",
    topSpeed: 900, cruiseSpeed: 833,
    fuelCapacityL: 32000, burnRateKgHr: 2650, fuelDensity: 0.804,
    thrustPerEngineLb: 31000, totalThrustLb: 62000, powerToLift: 0.29,
    cabinDim: "32.5m x 3.9m", maxSeatingEcon: 192,
    fourClassCap: "164 (F:0, B:8, PE:16, E:140)",
    dragCoefficient: 0.030, startupNoise: 88, cruiseNoise: 74,
    unitsSold: 200,
    materials: "Range‑extended fuel system",
    engineOptions: [
        "CFM International LEAP‑1C"
    ],
    knownFor: "Designed for longer regional missions.",
    pilotQuote: "Better cruise margin than the standard C919.",
    pilotExperience: 9
});

/* ============================
   COMAC C929 WIDEBODY
   ============================ */

window.planesRegistry.push({
    model: "COMAC C929",
    manufacturer: "COMAC",
    topSpeed: 930, cruiseSpeed: 903,
    fuelCapacityL: 156000, burnRateKgHr: 7200, fuelDensity: 0.804,
    thrustPerEngineLb: 78000, totalThrustLb: 156000, powerToLift: 0.29,
    cabinDim: "58.0m x 5.8m", maxSeatingEcon: 350,
    fourClassCap: "290 (F:8, B:42, PE:48, E:192)",
    dragCoefficient: 0.027, startupNoise: 85, cruiseNoise: 73,
    unitsSold: 0,
    materials: "Composite widebody structure",
    engineOptions: [
        "Proposed engine: CRAIC / PD‑35 derivative",
        "Alternative: Rolls‑Royce UltraFan (conceptual)"
    ],
    knownFor: "Planned long‑range twinjet to rival A350‑900.",
    pilotQuote: "Expected to fly like a heavy A330neo hybrid.",
    pilotExperience: 8.9
});

/* ============================
   COMAC C939 FUTURE CONCEPT
   ============================ */

window.planesRegistry.push({
    model: "COMAC C939",
    manufacturer: "COMAC",
    topSpeed: 940, cruiseSpeed: 905,
    fuelCapacityL: 210000, burnRateKgHr: 9000, fuelDensity: 0.804,
    thrustPerEngineLb: 90000, totalThrustLb: 180000, powerToLift: 0.30,
    cabinDim: "72.0m x 6.2m", maxSeatingEcon: 450,
    fourClassCap: "380 (F:12, B:60, PE:60, E:248)",
    dragCoefficient: 0.026, startupNoise: 86, cruiseNoise: 75,
    unitsSold: 0,
    materials: "Next‑generation composite fuselage",
    engineOptions: [
        "Next‑gen high bypass concept",
        "UltraFan-class study"
    ],
    knownFor: "Future large widebody concept.",
    pilotQuote: "Intended to rival the A350‑1000 and 777‑9.",
    pilotExperience: 9.3
});

window.planesRegistry = window.planesRegistry || [];

/* ============================
   COMAC C949 (Supersonic Airliner)
   ============================ */

window.planesRegistry.push({
    model: "COMAC C949",
    manufacturer: "COMAC",
    topSpeed: 1810,            // Mach 1.6–1.7 reported (avg converted km/h) [1](https://en.wikipedia.org/wiki/Comac_C949)
    cruiseSpeed: 1700,
    fuelCapacityL: 68000,      // early concept data (dynamic fuel system ~42,000 kg) [4](https://aviationa2z.com/index.php/2025/04/01/china-unveils-comac-c949-supersonic-jet-to-rival-concorde/)
    burnRateKgHr: 8500,
    fuelDensity: 0.804,
    thrustPerEngineLb: 55000,  // adaptive-cycle SST turbofan estimation [4](https://aviationa2z.com/index.php/2025/04/01/china-unveils-comac-c949-supersonic-jet-to-rival-concorde/)
    totalThrustLb: 110000,
    powerToLift: 0.38,
    cabinDim: "38m x 3.2m",
    maxSeatingEcon: 168,       // confirmed from AirDataNews (C949 seats 168) [5](https://www.airdatanews.com/chinese-concorde-comac-outlines-the-supersonic-c949/)
    fourClassCap: "168 (F:0, B:48, PE:24, E:96)",
    dragCoefficient: 0.020,    // SST aerodynamic profile (reverse-camber fuselage) [3](https://www.euronews.com/next/2025/04/03/what-we-know-about-chinas-plans-for-a-new-supersonic-jet-that-can-fly-50-further-than-conc)
    startupNoise: 84,          // low-boom design (≈ hairdryer noise 89 dB) [3](https://www.euronews.com/next/2025/04/03/what-we-know-about-chinas-plans-for-a-new-supersonic-jet-that-can-fly-50-further-than-conc)
    cruiseNoise: 78,
    unitsSold: 0,              // still in design phase
    materials: "Composite fuselage, reverse-camber body, titanium leading edges",
    engineOptions: [
        "Twin adaptive-cycle turbofan (COMAC concept)",  // [4](https://aviationa2z.com/index.php/2025/04/01/china-unveils-comac-c949-supersonic-jet-to-rival-concorde/)
        "Low-boom subsonic-supersonic variable-cycle engine"
    ],
    knownFor: "China’s planned quiet supersonic jet, 50% more range than Concorde.",
    pilotQuote: "Expected to fly smoother and quieter than any previous SST.",
    pilotExperience: 9.4
});